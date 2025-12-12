import React from "react";
import { Trash2, Edit3 } from "lucide-react";

interface PolicyCardProps {
  policyType: string;
  leaveTypeId: string;
  isActive: boolean;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  onEdit: () => void;
  onDelete: () => void;
}

export default function PolicyCard({
  policyType,
  leaveTypeId,
  isActive,
  effectiveFrom,
  effectiveTo,
  onEdit,
  onDelete,
}: PolicyCardProps) {
  
  const start = effectiveFrom
    ? new Date(effectiveFrom).toLocaleDateString()
    : "—";

  const end = effectiveTo
    ? new Date(effectiveTo).toLocaleDateString()
    : "No end date";

  // Correct active badge
  const activeColor = isActive
    ? "bg-green-600/20 text-green-400"
    : "bg-red-600/20 text-red-400";

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow backdrop-blur">
      
      {/* HEADER */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-semibold text-white">{policyType}</h2>

          <p className="text-cyan-300 text-sm font-medium mt-1">
            Leave Type:{" "}
            <span className="text-white text-lg font-semibold">
              {leaveTypeId}
            </span>
          </p>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-4 mt-4">
        <button
          onClick={onEdit}
          className="text-cyan-400 hover:text-cyan-200 transition"
        >
          <Edit3 className="w-5 h-5" />
        </button>

        <button
          onClick={onDelete}
          className="text-red-400 hover:text-red-300 transition"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
}
