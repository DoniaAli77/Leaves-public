import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";

type LeaveRequest = {
  _id: string;
  employeeId: string;
  leaveTypeId: string;
  status: "pending" | "approved" | "rejected" | "cancelled" | string;
  createdAt?: string;

  // These fields might exist depending on your schema/service response:
  dates?: { from?: string; to?: string };
  startDate?: string;
  endDate?: string;
  durationDays?: number;
  totalDays?: number;
};

function normalizeRole(raw: string | null) {
  return (raw || "").toUpperCase().replaceAll(" ", "_");
}

function decodeJwtPayload(token: string): any | null {
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return null;
    const json = atob(payloadPart);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

const HR_ROLES = new Set(["HR_MANAGER", "HR_ADMIN", "HR_EMPLOYEE", "SYSTEM_ADMIN"]);

export default function LeaveHistoryPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);

  const [role, setRole] = useState<string>("");
  const [myEmployeeId, setMyEmployeeId] = useState<string>("");

  // Filters
  const [status, setStatus] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [leaveTypeId, setLeaveTypeId] = useState<string>("");

  // HR-only filter: ability to view a specific employee, or leave empty to view all
  const [employeeId, setEmployeeId] = useState<string>("");

  const [items, setItems] = useState<LeaveRequest[]>([]);
  const [error, setError] = useState<string | null>(null);

  const isHR = useMemo(() => HR_ROLES.has(role), [role]);

  // Backend base (keeps it configurable, but works out-of-the-box for you)
  const API_BASE = useMemo(() => {
    return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedRole = localStorage.getItem("role");

    if (!token) {
      router.push("/login");
      return;
    }

    const decoded = decodeJwtPayload(token);
    // Your JWT payload contains: { id, username, role, iat, exp }
    // So employeeId we care about is "id"
    const id = decoded?.id || "";

    setRole(normalizeRole(savedRole) || normalizeRole(decoded?.role || ""));
    setMyEmployeeId(id);

    setLoading(false);
  }, [router]);

  async function loadHistory() {
    setError(null);
    setFetching(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const params = new URLSearchParams();

      // ✅ shared filters for everyone
      if (status) params.set("status", status);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      if (leaveTypeId) params.set("leaveTypeId", leaveTypeId);

      // ✅ “All roles” requirement behavior:
      // - HR roles can view ALL history (no employeeId) OR filter by employeeId
      // - Non-HR roles should only see THEIR OWN history -> force employeeId = myEmployeeId
      if (isHR) {
        if (employeeId.trim()) params.set("employeeId", employeeId.trim());
      } else {
        if (!myEmployeeId) throw new Error("Missing employee id in token payload");
        params.set("employeeId", myEmployeeId);
      }

      const url = `${API_BASE}/leave-request/history?${params.toString()}`;

      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // If server returns 401/403/etc, read message nicely
      if (!res.ok) {
        let msg = `Request failed (${res.status})`;
        try {
          const j = await res.json();
          msg = j?.message || msg;
        } catch {}
        throw new Error(msg);
      }

      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setItems([]);
      setError(e?.message || "Failed to load history");
    } finally {
      setFetching(false);
    }
  }

  function resetFilters() {
    setStatus("");
    setStartDate("");
    setEndDate("");
    setLeaveTypeId("");
    setEmployeeId("");
    setItems([]);
    setError(null);
  }

  // Auto-load once on open
  useEffect(() => {
    if (!loading) loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-8 text-white">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Leave Request History</h1>
          <p className="text-white/60 text-sm mt-1">
            Filter request history (all roles).{" "}
            {isHR ? "HR can view all or filter by employee ID." : "Showing your own history."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded bg-white/10 border border-white/10 text-xs font-semibold">
            {role || "UNKNOWN_ROLE"}
          </div>

          <button
            onClick={() => router.push("/subsystems/leaves/requests")}
            className="px-3 py-1.5 text-xs rounded bg-white/10 hover:bg-white/15 border border-white/10"
          >
            Back to Requests
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Status */}
          <div>
            <label className="block text-xs text-white/60 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 rounded bg-white/10 border border-white/10 text-sm"
            >
              <option value="">All</option>
              <option value="pending">pending</option>
              <option value="approved">approved</option>
              <option value="rejected">rejected</option>
              <option value="cancelled">cancelled</option>
            </select>
          </div>

          {/* Start */}
          <div>
            <label className="block text-xs text-white/60 mb-1">Start date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded bg-white/10 border border-white/10 text-sm"
            />
          </div>

          {/* End */}
          <div>
            <label className="block text-xs text-white/60 mb-1">End date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 rounded bg-white/10 border border-white/10 text-sm"
            />
          </div>

          {/* Leave type */}
          <div>
            <label className="block text-xs text-white/60 mb-1">Leave Type ID</label>
            <input
              value={leaveTypeId}
              onChange={(e) => setLeaveTypeId(e.target.value)}
              placeholder="optional"
              className="w-full px-3 py-2 rounded bg-white/10 border border-white/10 text-sm"
            />
          </div>

          {/* HR-only Employee filter */}
          {isHR ? (
            <div>
              <label className="block text-xs text-white/60 mb-1">Employee ID</label>
              <input
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="optional (blank = all)"
                className="w-full px-3 py-2 rounded bg-white/10 border border-white/10 text-sm"
              />
            </div>
          ) : (
            <div className="hidden md:block" />
          )}
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={loadHistory}
            disabled={fetching}
            className="px-4 py-2 text-sm rounded bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60"
          >
            {fetching ? "Applying..." : "Apply Filters"}
          </button>

          <button
            onClick={resetFilters}
            className="px-4 py-2 text-sm rounded bg-white/10 hover:bg-white/15 border border-white/10"
          >
            Reset
          </button>

          <button
            onClick={() => router.push("/dashboard")}
            className="ml-auto px-4 py-2 text-sm rounded bg-white/10 hover:bg-white/15 border border-white/10"
          >
            Dashboard
          </button>
        </div>

        {error && <div className="mt-3 text-sm text-red-300">{error}</div>}
      </div>

      {/* Results */}
      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="glass-card p-5 text-white/70">
            No results. Try changing filters.
          </div>
        ) : (
          items.map((r) => {
            const from =
              r.dates?.from || r.startDate ? new Date(r.dates?.from || (r.startDate as string)).toLocaleDateString() : "—";
            const to =
              r.dates?.to || r.endDate ? new Date(r.dates?.to || (r.endDate as string)).toLocaleDateString() : "—";
            const days =
              typeof r.durationDays === "number"
                ? r.durationDays
                : typeof r.totalDays === "number"
                ? r.totalDays
                : null;

            return (
              <div key={r._id} className="glass-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-lg font-semibold capitalize">{r.status || "unknown"}</div>
                    <div className="text-sm text-white/70 mt-1">
                      Dates: {from} → {to}
                    </div>
                    <div className="text-sm text-white/70">
                      Duration: {days !== null ? `${days} day(s)` : "—"}
                    </div>

                    <div className="text-xs text-white/50 mt-2">Request ID: {r._id}</div>
                    <div className="text-xs text-white/50">Employee ID: {String(r.employeeId)}</div>
                    <div className="text-xs text-white/50">Leave Type ID: {String(r.leaveTypeId)}</div>
                    {r.createdAt && (
                      <div className="text-xs text-white/50">
                        Created: {new Date(r.createdAt).toLocaleString()}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => router.push(`/subsystems/leaves/requests/${r._id}`)}
                    className="px-3 py-1.5 text-xs rounded bg-white/10 hover:bg-white/15 border border-white/10"
                  >
                    View
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
