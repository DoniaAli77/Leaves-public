import React, { useEffect, useState } from "react";
import { createLeaveRequest } from "@/services/leaves/leaveRequests.api";
import { getLeaveTypes } from "@/services/leaves/leaveTypes.api";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";
import { isEmployee } from "@/utils/roles";

interface LeaveType {
  _id: string;
  name: string;
}

export default function CreateRequestPage() {
  const { user } = useAuth();
  const router = useRouter();

  // 🔒 EMPLOYEE ONLY
  if (!isEmployee(user?.roles)) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        Unauthorized – employees only
      </div>
    );
  }

  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [justification, setJustification] = useState("");

  useEffect(() => {
    getLeaveTypes().then((res) => setLeaveTypes(res.data || []));
  }, []);

  const handleSubmit = async () => {
    if (!leaveTypeId || !startDate || !endDate) {
      alert("Please fill all required fields");
      return;
    }

    try {
      await createLeaveRequest({
        employeeId: user!.id, // ✅ FIX — REQUIRED BY BACKEND
        leaveTypeId,
        startDate,
        endDate,
        justification,
      });

      router.push("/subsystems/leaves/requests");
    } catch (err) {
      console.error("Failed to create request", err);
      alert("Error creating request");
    }
  };

  return (
    <div className="min-h-screen p-10 bg-slate-900 text-white">
      <div className="max-w-lg mx-auto bg-slate-800 p-6 rounded-xl border border-white/10">

        <h1 className="text-3xl mb-6 font-semibold">New Leave Request</h1>

        <div className="space-y-4">

          <div>
            <label className="text-gray-300 text-sm">Leave Type</label>
            <select
              className="w-full p-2 rounded bg-slate-700"
              value={leaveTypeId}
              onChange={(e) => setLeaveTypeId(e.target.value)}
            >
              <option value="">Choose type</option>
              {leaveTypes.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-gray-300 text-sm">Start Date</label>
              <input
                type="date"
                className="w-full p-2 rounded bg-slate-700"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="flex-1">
              <label className="text-gray-300 text-sm">End Date</label>
              <input
                type="date"
                className="w-full p-2 rounded bg-slate-700"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-gray-300 text-sm">Justification</label>
            <textarea
              className="w-full p-2 rounded bg-slate-700"
              rows={3}
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
            />
          </div>

        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleSubmit}
            className="px-5 py-2 bg-blue-600 rounded-lg"
          >
            Submit Request
          </button>
        </div>
      </div>
    </div>
  );
}
