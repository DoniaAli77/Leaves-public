import React, { useEffect, useState } from "react";
import {
  getLeaveRequests,
  approveLeaveRequest,
  rejectLeaveRequest,
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

export default function LeaveRequestsPage() {
  const { user } = useAuth();

  // ✅ Employees allowed to CREATE requests
  const canCreate =
    user?.roles?.includes(SystemRole.HR_EMPLOYEE) ||
    user?.roles?.includes(SystemRole.DEPARTMENT_EMPLOYEE);

  // ✅ Managers allowed to APPROVE / REJECT
  const canApprove = isManager(user?.roles);

  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadRequests = async () => {
    try {
      const res = await getLeaveRequests();
      setRequests(res.data || []);
    } catch (err) {
      console.error("Failed to load leave requests", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

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

  return (
    <div className="min-h-screen p-10 text-white bg-slate-900">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-semibold">Leave Requests</h1>

          {canCreate && (
            <Link
              href="/subsystems/leaves/requests/create"
              className="px-5 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
            >
              + New Request
            </Link>
          )}
        </div>

        {loading ? (
          <p className="text-gray-300">Loading...</p>
        ) : requests.length === 0 ? (
          <p className="text-gray-400">No requests found.</p>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
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
                    <div className="text-gray-400">
                      {req.durationDays} days
                    </div>
                  </div>
                </Link>

                {/* ✅ MANAGER ACTIONS */}
                {canApprove && req.status?.toLowerCase() === "pending" && (
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
