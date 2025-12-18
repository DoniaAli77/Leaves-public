// components/leaves/forms/LeaveRequestForm.tsx
import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { isEmployee } from "@/utils/roles";

interface LeaveType {
  _id: string;
  name: string;
}

interface Props {
  leaveTypes: LeaveType[];
  onSubmit: (data: any) => Promise<void>;
  errorMessage?: string | null; // NEW — server errors displayed nicely
}

export default function LeaveRequestForm({ leaveTypes, onSubmit, errorMessage }: Props) {
    const { user } = useAuth();

  // 🔒 EMPLOYEE ONLY
  if (!isEmployee(user?.roles)) {
    return (
      <div className="bg-slate-900 p-6 rounded-xl text-red-400 border border-white/10">
        Only employees can create leave requests
      </div>
    );
  }
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [justification, setJustification] = useState("");

  const handleSubmit = async () => {
    if (!leaveTypeId || !startDate || !endDate) {
      return;
    }

    await onSubmit({
      leaveTypeId,
      startDate,
      endDate,
      justification,
    });
  };

  return (
    <div className="bg-slate-900 p-6 rounded-xl border border-white/10 max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-white">Create Leave Request</h2>

      {/* ERROR MESSAGE UI */}
      {errorMessage && (
        <div className="mb-4 p-3 rounded-md bg-red-500/20 text-red-300 border border-red-500/40">
          {errorMessage}
        </div>
      )}

      <label className="text-sm text-gray-300">Leave Type</label>
      <select
        value={leaveTypeId}
        onChange={(e) => setLeaveTypeId(e.target.value)}
        className="w-full p-2 mt-1 mb-4 rounded-md bg-white/5 border border-white/10 text-white"
      >
        <option value="">Select type…</option>
        {leaveTypes.map((lt) => (
          <option key={lt._id} value={lt._id}>
            {lt.name}
          </option>
        ))}
      </select>

      <label className="text-sm text-gray-300">Start Date</label>
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className="w-full p-2 mt-1 mb-4 rounded-md bg-white/5 border border-white/10 text-white"
      />

      <label className="text-sm text-gray-300">End Date</label>
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        className="w-full p-2 mt-1 mb-4 rounded-md bg-white/5 border border-white/10 text-white"
      />

      <label className="text-sm text-gray-300">Justification</label>
      <textarea
        value={justification}
        onChange={(e) => setJustification(e.target.value)}
        className="w-full p-2 mt-1 mb-4 rounded-md bg-white/5 border border-white/10 text-white"
        rows={3}
      />

      <button
        onClick={handleSubmit}
        className="w-full mt-2 p-3 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg text-white font-semibold"
      >
        Submit Request
      </button>
    </div>
  );
}
