import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";
import { isAdmin } from "@/utils/roles";
import { createLeaveEntitlement } from "@/services/leaves/leaveEntitlements.api";

export default function CreateEntitlementPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [employeeId, setEmployeeId] = useState("");
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [totalDays, setTotalDays] = useState(0);
  const [year, setYear] = useState(new Date().getFullYear());

  // 🔒 ADMIN ONLY
  if (!isAdmin(user?.roles)) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        Unauthorized – Admin only
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!employeeId || !leaveTypeId || !totalDays) {
      alert("All fields are required");
      return;
    }

    await createLeaveEntitlement({
      employeeId,
      leaveTypeId,
      totalDays,
      year,
    });

    router.push(`/subsystems/leaves/entitlements/${employeeId}`);
  };

  return (
    <div className="min-h-screen p-10 bg-slate-900 text-white">
      <div className="max-w-md mx-auto bg-slate-800 p-6 rounded-xl">
        <h1 className="text-2xl font-semibold mb-4">
          Create Leave Entitlement
        </h1>

        <input
          placeholder="Employee ID"
          className="w-full mb-3 p-2 rounded bg-slate-700"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
        />

        <input
          placeholder="Leave Type ID"
          className="w-full mb-3 p-2 rounded bg-slate-700"
          value={leaveTypeId}
          onChange={(e) => setLeaveTypeId(e.target.value)}
        />

        <input
          type="number"
          placeholder="Total Days"
          className="w-full mb-3 p-2 rounded bg-slate-700"
          value={totalDays}
          onChange={(e) => setTotalDays(Number(e.target.value))}
        />

        <input
          type="number"
          placeholder="Year"
          className="w-full mb-4 p-2 rounded bg-slate-700"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        />

        <button
          onClick={handleSubmit}
          className="w-full py-2 bg-green-600 rounded"
        >
          Create
        </button>
      </div>
    </div>
  );
}
