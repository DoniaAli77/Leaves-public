import React from "react";
import { Trash2, Edit3 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { isAdmin } from "@/utils/roles";

interface PolicyCardProps {
  policyType: string;
  leaveTypeId: string;
  isActive: boolean;

  minServiceMonths?: number;
  maxServiceMonths?: number;

  effectiveFrom?: string | null;
  effectiveTo?: string | null;

  maxDaysPerRequest?: number;
  maxRequestsPerYear?: number;

  carryForwardAllowed?: boolean;
  carryForwardLimit?: number;

  // ✅ OPTIONAL — role-based UI
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function PolicyCard({
  policyType,
  leaveTypeId,
  isActive,
  minServiceMonths,
  maxServiceMonths,
  effectiveFrom,
  effectiveTo,
  maxDaysPerRequest,
  maxRequestsPerYear,
  carryForwardAllowed,
  carryForwardLimit,
  onEdit,
  onDelete,
}: PolicyCardProps) {
  const { user } = useAuth();
  const canManage = isAdmin(user?.roles);

  const start = effectiveFrom
    ? new Date(effectiveFrom).toLocaleDateString()
    : "—";

  const end = effectiveTo
    ? new Date(effectiveTo).toLocaleDateString()
    : "No end date";

  const activeColor = isActive
    ? "bg-green-600/20 text-green-400"
    : "bg-red-600/20 text-red-400";

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow backdrop-blur">

      {/* HEADER */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-semibold text-white">
            {policyType}
          </h2>

          <p className="text-cyan-300 text-sm font-medium mt-1">
            Leave Type:{" "}
            <span className="text-white text-lg font-semibold">
              {leaveTypeId}
            </span>
          </p>
        </div>

        <span className={`px-3 py-1 rounded-lg text-sm ${activeColor}`}>
          {isActive ? "Active" : "Inactive"}
        </span>
      </div>

      {/* DETAILS */}
      <div className="text-sm text-gray-300 space-y-1">
        <p>
          <span className="font-medium">Service:</span>{" "}
          {minServiceMonths ?? 0} – {maxServiceMonths ?? "∞"} months
        </p>

        <p>
          <span className="font-medium">From:</span> {start}
        </p>

        <p>
          <span className="font-medium">To:</span> {end}
        </p>

        <p>
          <span className="font-medium">Max Days / Request:</span>{" "}
          {maxDaysPerRequest ?? "—"}
        </p>

        <p>
          <span className="font-medium">Max Requests / Year:</span>{" "}
          {maxRequestsPerYear ?? "—"}
        </p>

        <p>
          <span className="font-medium">Carry Forward:</span>{" "}
          {carryForwardAllowed
            ? `Yes (Limit: ${carryForwardLimit ?? 0})`
            : "No"}
        </p>
      </div>

      {/* ACTIONS — ADMIN ONLY */}
      {canManage && (onEdit || onDelete) && (
        <div className="flex gap-4 mt-5">
          {onEdit && (
            <button
              onClick={onEdit}
              className="text-cyan-400 hover:text-cyan-200 transition"
              title="Edit policy"
            >
              <Edit3 className="w-5 h-5" />
            </button>
          )}

          {onDelete && (
            <button
              onClick={onDelete}
              className="text-red-400 hover:text-red-300 transition"
              title="Delete policy"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
