import React, { useEffect, useState } from "react";
import { getLeaveRequests } from "@/services/leaves/leaveRequests.api";
import Link from "next/link";

interface LeaveRequest {
  _id: string;
  employeeId: string;
  leaveTypeId: string;
  status: string;
  dates: { from: string; to: string };
  durationDays: number;
}

export default function LeaveRequestsPage() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen p-10 text-white bg-slate-900">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-semibold">Leave Requests</h1>
          <Link
            href="/subsystems/leaves/requests/create"
            className="px-5 py-3 bg-blue-600 rounded-lg"
          >
            + New Request
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-300">Loading...</p>
        ) : requests.length === 0 ? (
          <p className="text-gray-400">No requests found.</p>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <Link
                key={req._id}
                href={`/subsystems/leaves/requests/${req._id}`}
                className="block bg-slate-800 p-4 rounded-xl border border-white/10 hover:bg-slate-700 transition"
              >
                <div className="flex justify-between">
                  <div>
                    <div className="text-lg font-semibold">{req.status}</div>
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
