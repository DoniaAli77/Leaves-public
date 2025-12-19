import { Trash2, Edit3 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { isAdmin } from "@/utils/roles";

export default function EntitlementCard({
  entitlement,
  onEdit,
  onDelete,
}: any) {
  const { user } = useAuth();
  const admin = isAdmin(user?.roles);

  return (
    <div className="bg-slate-800 p-4 rounded-xl border border-white/10">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-white font-semibold">
            Leave Type: {entitlement.leaveTypeId?.name}
          </h3>

          <p className="text-gray-300 mt-2">
            Total Days: {entitlement.yearlyEntitlement}
          </p>
          <p className="text-gray-300">
            Used Days: {entitlement.taken}
          </p>
          <p className="text-gray-300">
            Pending Days: {entitlement.pending}
          </p>
          <p className="text-gray-300">
            Remaining: {entitlement.remaining}
          </p>
          <p className="text-gray-300">
            Year: {entitlement.year}
          </p>
        </div>

        {admin && (
          <div className="flex gap-3">
            <button onClick={() => onEdit(entitlement)}>
              <Edit3 size={18} />
            </button>
            <button onClick={() => onDelete(entitlement)}>
              <Trash2 size={18} className="text-red-400" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
