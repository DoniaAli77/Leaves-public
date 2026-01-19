import React, { useEffect, useMemo, useState } from "react";
import {
  getLeaveRequests,
  approveLeaveRequest,
  rejectLeaveRequest,
  bulkProcessLeaveRequests, // ✅ NEW
} from "@/services/leaves/leaveRequests.api";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { isManager } from "@/utils/roles";
import { SystemRole } from "@/enums/SystemRole";

interface LeaveRequest {
  _id: string;
  employeeId: string;
  leaveTypeId: string;
  status: string;
  dates: {
    from: string;
    to: string;
  };
  durationDays: number;
}

type BulkDecision = "APPROVED" | "REJECTED";

export default function LeaveRequestsPage() {
  const { user } = useAuth();

  // Employees allowed to CREATE requests
  const canCreate =
    user?.roles?.includes(SystemRole.HR_EMPLOYEE) ||
    user?.roles?.includes(SystemRole.DEPARTMENT_EMPLOYEE);

  // Managers allowed to APPROVE / REJECT (single request)
  const canApprove = isManager(user?.roles);

  // HR Manager allowed to BULK approve/reject
  const canBulk = user?.roles?.includes(SystemRole.HR_MANAGER);

  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // bulk state
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkItems, setBulkItems] = useState<
    Record<
      string,
      {
        selected: boolean;
        decision: BulkDecision;
        reason: string;
      }
    >
  >({});

  const loadRequests = async () => {
    try {
      const res = await getLeaveRequests();
      const data: LeaveRequest[] = res.data || [];
      setRequests(data);

      // initialize bulk state only for PENDING requests
      if (canBulk) {
        setBulkItems((prev) => {
          const next: typeof prev = {};
          for (const r of data) {
            if ((r.status || "").toLowerCase().includes("pending")) {
              next[r._id] = {
                selected: prev[r._id]?.selected ?? false,
                decision: prev[r._id]?.decision ?? "APPROVED",
                reason: prev[r._id]?.reason ?? "",
              };
            }
          }
          return next;
        });
      }
    } catch (err) {
      console.error("Failed to load leave requests", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canBulk]);

  const handleApprove = async (id: string) => {
    if (!user) return;
    setActionLoading(id);
    try {
      await approveLeaveRequest(id, user.id);
      await loadRequests();
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!user) return;
    setActionLoading(id);
    try {
      await rejectLeaveRequest(id, user.id, "Rejected by manager");
      await loadRequests();
    } finally {
      setActionLoading(null);
    }
  };

  // helpers for bulk UI
  const selectedCount = useMemo(() => {
    return Object.values(bulkItems).filter((x) => x.selected).length;
  }, [bulkItems]);

  const toggleBulkSelect = (id: string) => {
    setBulkItems((prev) => ({
      ...prev,
      [id]: { ...prev[id], selected: !prev[id]?.selected },
    }));
  };

  const setBulkDecision = (id: string, decision: BulkDecision) => {
    setBulkItems((prev) => ({
      ...prev,
      [id]: { ...prev[id], decision },
    }));
  };

  const setBulkReason = (id: string, reason: string) => {
    setBulkItems((prev) => ({
      ...prev,
      [id]: { ...prev[id], reason },
    }));
  };

  const selectAllPending = () => {
    setBulkItems((prev) => {
      const next: typeof prev = {};
      for (const [id, val] of Object.entries(prev)) {
        next[id] = { ...val, selected: true };
      }
      return next;
    });
  };

  const clearSelection = () => {
    setBulkItems((prev) => {
      const next: typeof prev = {};
      for (const [id, val] of Object.entries(prev)) {
        next[id] = { ...val, selected: false };
      }
      return next;
    });
  };

  const handleBulkSubmit = async () => {
    if (!user?.id) {
      alert("You must be logged in as HR Manager.");
      return;
    }

    const selected = Object.entries(bulkItems)
      .filter(([_, v]) => v.selected)
      .map(([id, v]) => ({
        id,
        decision: v.decision,
        reason:
          v.decision === "REJECTED" ? (v.reason?.trim() || "Rejected") : undefined,
      }));

    if (selected.length === 0) {
      alert("Select at least 1 pending request first.");
      return;
    }

    try {
      setBulkLoading(true);

      const res = await bulkProcessLeaveRequests({
        approverId: user.id,
        requests: selected,
      });

      // Your backend likely returns { success:[], failed:[] }
      const data = res.data;

      if (data?.success || data?.failed) {
        alert(
          `Bulk done ✅\nSuccess: ${data.success?.length || 0}\nFailed: ${
            data.failed?.length || 0
          }`
        );
      } else {
        // fallback if backend returns something else
        alert("Bulk done ✅");
      }

      await loadRequests();
    } catch (err) {
      console.error("Bulk failed", err);
      alert("Bulk failed ❌ (check console)");
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-10 text-white bg-slate-900">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
  <h1 className="text-4xl font-semibold">Leave Requests</h1>

  {/* RIGHT SIDE BUTTONS */}
  <div className="flex items-center gap-3">
    {/* History button (ALL roles can use it) */}
    <Link
      href="/subsystems/leaves/requests/history"
      className="px-5 py-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition"
    >
      Request History
    </Link>

    {/* Existing create button (only roles that can create) */}
    {canCreate && (
      <Link
        href="/subsystems/leaves/requests/create"
        className="px-5 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
      >
        + New Request
      </Link>
    )}
  </div>
</div>

        {/* Bulk box (HR Manager only) */}
        {canBulk && (
          <div className="mb-6 bg-slate-800 p-4 rounded-xl border border-white/10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <div className="text-xl font-semibold">
                  Bulk Request Processing (Approve/Reject multiple requests)
                </div>
                <div className="text-gray-400 text-sm mt-1">
                  Select pending requests below, choose decision, then submit bulk.
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={selectAllPending}
                  className="px-4 py-2 bg-slate-700 rounded hover:bg-slate-600"
                >
                  Select All
                </button>

                <button
                  onClick={clearSelection}
                  className="px-4 py-2 bg-slate-700 rounded hover:bg-slate-600"
                >
                  Clear
                </button>

                <button
                  onClick={handleBulkSubmit}
                  disabled={bulkLoading || selectedCount === 0}
                  className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {bulkLoading ? "Submitting..." : `Submit Bulk (${selectedCount})`}
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-gray-300">Loading...</p>
        ) : requests.length === 0 ? (
          <p className="text-gray-400">No requests found.</p>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => {
              const isPending = (req.status || "").toLowerCase().includes("pending");
              const bulkRow = bulkItems[req._id];

              return (
                <div
                  key={req._id}
                  className="bg-slate-800 p-4 rounded-xl border border-white/10"
                >
                  <Link
                    href={`/subsystems/leaves/requests/${req._id}`}
                    className="block hover:underline"
                  >
                    <div className="flex justify-between">
                      <div>
                        <div className="text-lg font-semibold capitalize">
                          {req.status}
                        </div>
                        <div className="text-gray-300">
                          {new Date(req.dates.from).toLocaleDateString()} →{" "}
                          {new Date(req.dates.to).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-gray-400">{req.durationDays} days</div>
                    </div>
                  </Link>

                  {/*  HR Manager bulk controls (only for pending) */}
                  {canBulk && isPending && bulkRow && (
                    <div className="mt-4 p-3 rounded bg-slate-900/40 border border-white/10">
                      <div className="flex flex-col md:flex-row gap-3 md:items-center">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={bulkRow.selected}
                            onChange={() => toggleBulkSelect(req._id)}
                          />
                          <span className="text-sm text-gray-200">
                            Select for bulk
                          </span>
                        </label>

                        <select
                          className="p-2 rounded bg-slate-700"
                          value={bulkRow.decision}
                          onChange={(e) =>
                            setBulkDecision(req._id, e.target.value as BulkDecision)
                          }
                        >
                          <option value="APPROVED">APPROVE</option>
                          <option value="REJECTED">REJECT</option>
                        </select>

                        <input
                          className="flex-1 p-2 rounded bg-slate-700 disabled:opacity-50"
                          placeholder="Reject reason (only if rejecting)"
                          value={bulkRow.reason}
                          onChange={(e) => setBulkReason(req._id, e.target.value)}
                          disabled={bulkRow.decision !== "REJECTED"}
                        />
                      </div>
                    </div>
                  )}

                  {/* MANAGER ACTIONS (single request) */}
                  {canApprove && isPending && (
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => handleApprove(req._id)}
                        disabled={actionLoading === req._id}
                        className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() => handleReject(req._id)}
                        disabled={actionLoading === req._id}
                        className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
