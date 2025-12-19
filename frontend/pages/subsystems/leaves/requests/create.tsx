import React, { useEffect, useState } from "react";
import { createLeaveRequest } from "@/services/leaves/leaveRequests.api";
import { getLeaveTypes } from "@/services/leaves/leaveTypes.api";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";
import { SystemRole } from "@/enums/SystemRole";

interface LeaveType {
  _id: string;
  name: string;
}

export default function CreateRequestPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [justification, setJustification] = useState("");
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    if (user !== undefined) {
      setAuthReady(true);
    }
  }, [user]);

  useEffect(() => {
    if (!authReady) return;
    getLeaveTypes().then((res) => setLeaveTypes(res.data || []));
  }, [authReady]);

  const isAllowed =
    user?.roles?.includes(SystemRole.HR_EMPLOYEE) ||
    user?.roles?.includes(SystemRole.DEPARTMENT_EMPLOYEE);

  if (!authReady) return null;

  if (!isAllowed) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        Unauthorized – employees only
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!leaveTypeId || !startDate || !endDate) {
      alert("Please fill all required fields");
      return;
    }

    try {
      await createLeaveRequest({
        employeeProfile: user!.id, // ✅ KEY CHANGE
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

          <input
            type="date"
            className="w-full p-2 rounded bg-slate-700"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <input
            type="date"
            className="w-full p-2 rounded bg-slate-700"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />

          <textarea
            className="w-full p-2 rounded bg-slate-700"
            rows={3}
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
          />
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
