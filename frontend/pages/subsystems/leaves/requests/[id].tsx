import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  getLeaveRequestById,
  approveLeaveRequest,
  rejectLeaveRequest,
} from "@/services/leaves/leaveRequests.api";
import { useAuth } from "@/hooks/useAuth";
import { isManager } from "@/utils/roles";

export default function RequestDetailsPage() {
  const router = useRouter();
  const { id } = router.query;

  const { user } = useAuth();
  const canApprove = isManager(user?.roles);

  const [req, setReq] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    getLeaveRequestById(id as string).then((res) => setReq(res.data));
  }, [id]);

  const refresh = async () => {
    const res = await getLeaveRequestById(id as string);
    setReq(res.data);
  };

  const handleApprove = async () => {
    if (!id || !user) return;
    setLoading(true);
    try {
      await approveLeaveRequest(id as string, user.id);
      await refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!id || !user) return;
    setLoading(true);
    try {
      await rejectLeaveRequest(id as string, user.id, "Rejected by manager");
      await refresh();
    } finally {
      setLoading(false);
    }
  };

  if (!req) return <p className="text-white p-10">Loading...</p>;

  return (
    <div className="min-h-screen p-10 bg-slate-900 text-white">
      <div className="max-w-xl mx-auto bg-slate-800 p-6 rounded-xl border border-white/10">

        <h1 className="text-3xl font-semibold mb-4">Leave Request</h1>

        <p><strong>Status:</strong> {req.status}</p>
        <p><strong>Employee:</strong> {req.employeeId}</p>

        <p className="mt-4">
          <strong>Dates:</strong><br />
          {new Date(req.dates.from).toLocaleDateString()} →{" "}
          {new Date(req.dates.to).toLocaleDateString()}
        </p>

        <p className="mt-4">
          <strong>Justification:</strong><br />
          {req.justification || "—"}
        </p>

        {/* ✅ MANAGER ACTIONS */}
        {canApprove && req.status?.toUpperCase() === "PENDING" && (
          <div className="flex gap-4 mt-6">
            <button
              onClick={handleApprove}
              disabled={loading}
              className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
            >
              Approve
            </button>

            <button
              onClick={handleReject}
              disabled={loading}
              className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
            >
              Reject
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
