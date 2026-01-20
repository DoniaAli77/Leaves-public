import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";

type LeaveEntitlementDoc = {
  _id?: string;
  year?: number;
  totalDays?: number;
  usedDays?: number;
  pendingDays?: number;
  leaveTypeId?: any; // populated doc or ObjectId
};

type LeaveRequestDoc = {
  _id?: string;
  status?: string;
  dates?: { from?: string; to?: string };
  leaveTypeId?: any;
};

type TeamMember = {
  _id?: string;
  employeeNumber?: string;
  firstName?: string;
  lastName?: string;
  employeeName?: string;
  primaryDepartmentId?: any;
  primaryPositionId?: any;
  supervisorPositionId?: any;
  status?: string;
};

type TeamLeaveSummary = {
  employee: TeamMember;
  entitlements: LeaveEntitlementDoc[];
  upcomingRequests: LeaveRequestDoc[];
};

function normalizeRole(user: any): string {
  // Your JWT shows: role: "department head"
  // Your frontend enum shows: SystemRole.DEPARTMENT_HEAD = "department head"
  // Some parts of UI might use: "DEPARTMENT_HEAD"
  const r1 = user?.role;
  if (typeof r1 === "string" && r1.length) return r1;

  const r2 = user?.roles;
  if (Array.isArray(r2) && r2.length) return String(r2[0]);
  if (typeof r2 === "string" && r2.length) return r2;

  return "";
}

function isDepartmentHeadRole(role: string) {
  // accept all common variants
  return (
    role === "department head" ||
    role === "DEPARTMENT_HEAD" ||
    role === "Department Head"
  );
}

function isHRAdminRole(role: string) {
  console.log("Checking HR Admin role for:", role);
  return role === "HR Admin" || role === "HR_ADMIN" || role === "hr admin";
}

export default function EntitlementIndex() {
  const router = useRouter();
  const { user } = useAuth();

  // ---------------------------
  // ✅ Hydration-safe mount gate
  // ---------------------------
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // ---------------------------
  // Page state (hooks must stay unconditional)
  // ---------------------------
  const [tab, setTab] = useState<"balances" | "upcoming">("balances");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TeamLeaveSummary[] | null>(null);
  const [error, setError] = useState("");

  // HR Admin mode (keep your old lookup as optional)
  const [employeeId, setEmployeeId] = useState("");

  const role = useMemo(() => normalizeRole(user as any), [user]);

  // scope from query (?scope=team)
  const scope = useMemo(() => {
    const raw = router.query.scope;
    return raw === "team" ? "team" : "admin";
  }, [router.query.scope]);

  const teamMode = scope === "team";

  const canUseTeam = isDepartmentHeadRole(role) || isHRAdminRole(role);
  const canUseAdmin = isHRAdminRole(role);

  

  async function loadTeamLeaves() {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found. Log in again.");
        setLoading(false);
        return;
      }

      const res = await fetch("http://localhost:3001/manager/team-leaves", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(
          `Failed to load team leaves (${res.status}). ${JSON.stringify(body)}`
        );
        setLoading(false);
        return;
      }

      // your backend returns an array of TeamLeaveSummary
      setData(Array.isArray(body) ? body : body?.data ?? []);
    } catch (e: any) {
      setError(e?.message || "Failed to load team leaves.");
    } finally {
      setLoading(false);
    }
  }

  // Auto-load once in team mode
  useEffect(() => {
    if (!mounted) return;        
  if (!teamMode) return;
  if (!canUseTeam) return;
  loadTeamLeaves();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [mounted, teamMode, canUseTeam]);

  if (!mounted) {
    return <div className="min-h-screen bg-slate-900" />;
  }

  // =========================
  // TEAM MODE UI
  // =========================
  if (teamMode) {
    if (!canUseTeam) {
      return (
        <div className="min-h-screen flex items-center justify-center text-red-400">
          You don&apos;t have access to Team Leaves.
          <div className="mt-2 text-xs text-white/50">
            Detected role: <span className="text-white/80">{role || "—"}</span>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen p-10 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto glass-card p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold">Team Leaves</h1>
              <p className="text-sm text-white/60">
                Direct manager view: team leave balances + upcoming approved
                leaves.
              </p>
              <p className="text-xs text-white/40 mt-1">
                (Your role detected: {role || "—"})
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => router.push("/dashboard")}
                className="glass-btn px-4 py-2 text-sm"
              >
                Dashboard
              </button>
              <button
                onClick={loadTeamLeaves}
                className="glow-btn px-4 py-2 text-sm"
                disabled={loading}
              >
                {loading ? "Loading..." : "Refresh"}
              </button>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setTab("balances")}
              className={`px-4 py-2 rounded text-sm ${
                tab === "balances"
                  ? "bg-blue-600"
                  : "bg-white/10 hover:bg-white/15"
              }`}
            >
              Balances
            </button>
            <button
              onClick={() => setTab("upcoming")}
              className={`px-4 py-2 rounded text-sm ${
                tab === "upcoming"
                  ? "bg-blue-600"
                  : "bg-white/10 hover:bg-white/15"
              }`}
            >
              Upcoming Approved
            </button>

            <div className="flex-1" />

            <button
              onClick={() => router.push("/subsystems/leaves/calendar?scope=team")}
              className="glass-btn px-4 py-2 text-sm"
            >
              Open Team Calendar
            </button>
          </div>

          {error ? (
            <div className="mt-6 p-4 rounded bg-red-500/10 border border-red-400/20 text-red-200 text-sm">
              {error}
            </div>
          ) : null}

          {!error && !data ? (
            <div className="mt-6 text-sm text-white/60">Loading…</div>
          ) : null}

          {!error && data && tab === "balances" ? (
            <div className="mt-6 space-y-4">
              {data.length === 0 ? (
                <div className="text-sm text-white/60">
                  No team members found (or no entitlements yet).
                </div>
              ) : null}

              {data.map((row, idx) => {
                const emp = row.employee || {};
                const name =
                  emp.employeeName ||
                  `${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim() ||
                  emp.employeeNumber ||
                  "—";

                return (
                  <div
                    key={idx}
                    className="rounded border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-white font-medium">{name}</div>
                        <div className="text-xs text-white/50">
                          Employee#: {emp.employeeNumber || "—"}
                        </div>
                      </div>
                      <div className="text-xs text-white/50">
                        Entitlements: {row.entitlements?.length || 0}
                      </div>
                    </div>

                    <div className="overflow-auto rounded border border-white/10">
                      <table className="w-full text-sm">
                        <thead className="bg-white/5 text-white/70">
                          <tr>
                            <th className="text-left p-3">Leave Type</th>
                            <th className="text-left p-3">Year</th>
                            <th className="text-left p-3">Total</th>
                            <th className="text-left p-3">Used</th>
                            <th className="text-left p-3">Pending</th>
                            <th className="text-left p-3">Remaining</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(row.entitlements || []).map((e, i) => {
                            const lt = e.leaveTypeId;
                            const leaveTypeName =
                              lt?.name || lt?.leaveTypeName || "—";
                            const total = e.totalDays ?? 0;
                            const used = e.usedDays ?? 0;
                            const pending = e.pendingDays ?? 0;
                            const remaining = total - used - pending;

                            return (
                              <tr
                                key={i}
                                className="border-t border-white/10 hover:bg-white/5"
                              >
                                <td className="p-3">{leaveTypeName}</td>
                                <td className="p-3">{e.year ?? "—"}</td>
                                <td className="p-3">{total}</td>
                                <td className="p-3">{used}</td>
                                <td className="p-3">{pending}</td>
                                <td className="p-3">{remaining}</td>
                              </tr>
                            );
                          })}

                          {(row.entitlements || []).length === 0 ? (
                            <tr className="border-t border-white/10">
                              <td className="p-3 text-white/60" colSpan={6}>
                                No entitlements found for this employee.
                              </td>
                            </tr>
                          ) : null}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}

          {!error && data && tab === "upcoming" ? (
            <div className="mt-6 space-y-4">
              {data.length === 0 ? (
                <div className="text-sm text-white/60">
                  No team members found.
                </div>
              ) : null}

              {data.map((row, idx) => {
                const emp = row.employee || {};
                const name =
                  emp.employeeName ||
                  `${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim() ||
                  emp.employeeNumber ||
                  "—";

                return (
                  <div
                    key={idx}
                    className="rounded border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-white font-medium">{name}</div>
                      <div className="text-xs text-white/50">
                        Upcoming Approved: {row.upcomingRequests?.length || 0}
                      </div>
                    </div>

                    {(row.upcomingRequests || []).length === 0 ? (
                      <div className="text-sm text-white/60">
                        No upcoming approved leaves.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {(row.upcomingRequests || []).map((r, i) => {
                          const from = r?.dates?.from
                            ? new Date(r.dates.from).toLocaleDateString()
                            : "—";
                          const to = r?.dates?.to
                            ? new Date(r.dates.to).toLocaleDateString()
                            : "—";
                          return (
                            <div
                              key={i}
                              className="rounded border border-white/10 bg-white/5 p-3 text-sm"
                            >
                              <div className="text-white">
                                {from} → {to}
                              </div>
                              <div className="text-xs text-white/50">
                                Status: {r.status || "—"}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  // =========================
  // ADMIN MODE UI (optional)
  // =========================
  if (!canUseAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        You don&apos;t have access to Entitlements.
        <div className="mt-2 text-xs text-white/50">
          Detected role: <span className="text-white/80">{role || "—"}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-10 bg-slate-900 text-white">
      <div className="max-w-md mx-auto glass-card p-6">
        <h1 className="text-2xl font-semibold mb-4">
          Employee Entitlement Lookup
        </h1>

        <input
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          placeholder="Employee Profile ID"
          className="w-full p-2 mb-4 rounded bg-slate-700"
        />

        <button
          onClick={() => router.push("/subsystems/leaves/entitlements/create")}
          className="mb-4 w-full py-2 bg-blue-600 rounded"
        >
          + Create Entitlement
        </button>

        <button
          onClick={() =>
            router.push(`/subsystems/leaves/entitlements/${employeeId}`)
          }
          disabled={!employeeId.trim()}
          className="w-full py-2 bg-blue-600 rounded disabled:opacity-50"
        >
          View Entitlements
        </button>
      </div>
    </div>
  );
}
