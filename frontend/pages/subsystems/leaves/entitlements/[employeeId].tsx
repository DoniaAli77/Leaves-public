import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { isAdmin } from "@/utils/roles";
import {
  getEmployeeEntitlement,
  updateLeaveEntitlement,
  deleteLeaveEntitlement,
} from "@/services/leaves/leaveEntitlements.api";
import EntitlementCard from "@/components/leaves/cards/EntitlementCard";
import LeaveEntitlementForm from "@/components/leaves/forms/LeaveEntitlementForm";

export default function EntitlementDetailsPage() {
  const router = useRouter();
  const { employeeId } = router.query;
  const { user } = useAuth();

  const [entitlements, setEntitlements] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!router.isReady || !employeeId) return;

    getEmployeeEntitlement(employeeId as string)
      .then((res) => setEntitlements(res.data || []))
      .finally(() => setLoading(false));
  }, [router.isReady, employeeId]);

  if (!isAdmin(user?.roles)) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        Unauthorized – Admin only
      </div>
    );
  }

  if (loading) {
    return <p className="p-10 text-gray-300">Loading...</p>;
  }

  const handleUpdate = async (data: any) => {
    if (!employeeId || !editing?.leaveTypeId?._id) return;

    await updateLeaveEntitlement(employeeId as string, {
      leaveTypeId: editing.leaveTypeId._id,
      totalDays: data.totalDays,
      usedDays: data.usedDays,
      pendingDays: data.pendingDays,
    });

    setEditing(null);

    const refreshed = await getEmployeeEntitlement(employeeId as string);
    setEntitlements(refreshed.data || []);
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "⚠ This will delete ALL entitlements for this employee. Continue?"
      )
    )
      return;

    await deleteLeaveEntitlement(employeeId as string);
    router.push("/subsystems/leaves/entitlements");
  };

  return (
    <div className="min-h-screen p-10 bg-slate-900 text-white">
      <h1 className="text-3xl font-semibold mb-6">Employee Entitlements</h1>

      <div className="space-y-4">
        {entitlements.map((ent) => (
          <EntitlementCard
            key={ent._id}
            entitlement={ent}
            onEdit={setEditing}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {editing && (
        <LeaveEntitlementForm
          initialData={editing}
          onSubmit={handleUpdate}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
