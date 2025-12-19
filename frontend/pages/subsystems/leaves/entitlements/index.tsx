import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";
import { isAdmin } from "@/utils/roles";

export default function EntitlementIndex() {
  const { user } = useAuth();
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState("");

  if (!isAdmin(user?.roles)) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        Admin only
      </div>
    );
  }

  return (
    <div className="min-h-screen p-10 bg-slate-900 text-white">
      <div className="max-w-md mx-auto bg-slate-800 p-6 rounded-xl">
        <h1 className="text-2xl font-semibold mb-4">
          Employee Entitlement Lookup
        </h1>

        <input
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          placeholder="Employee ID"
          className="w-full p-2 mb-4 rounded bg-slate-700"
        />

        <button
  onClick={() =>
    router.push("/subsystems/leaves/entitlements/create")
  }
  className="mb-4 w-full py-2 bg-blue-600 rounded"
>
  + Create Entitlement
</button>


        <button
          onClick={() =>
            router.push(`/subsystems/leaves/entitlements/${employeeId}`)
          }
          className="w-full py-2 bg-blue-600 rounded"
        >
          View Entitlements
        </button>
      </div>
    </div>
  );
}
