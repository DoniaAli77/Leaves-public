import React from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { isManager } from "@/utils/roles";

interface RequestCardProps {
  _id: string;
  status: string;
  employeeId: string;
  leaveTypeId: string;
  dates: {
    from: string;
    to: string;
  };
  durationDays: number;
}

export default function RequestCard({
  _id,
  status,
  employeeId,
  leaveTypeId,
  dates,
  durationDays,
}: RequestCardProps) {
  const { user } = useAuth();
  const isMgr = isManager(user?.roles);

  const statusColor =
    status === "APPROVED"
      ? "text-green-400"
      : status === "REJECTED"
      ? "text-red-400"
      : "text-yellow-400";

  return (
    <Link
      href={`/subsystems/leaves/requests/${_id}`}
      className="block bg-slate-800 p-4 rounded-xl border border-white/10 
                 hover:bg-slate-700 transition"
    >
      <div className="flex justify-between items-center">
        <div>
          <p className={`text-lg font-semibold ${statusColor}`}>
            {status}
          </p>

          <p className="text-gray-300 text-sm mt-1">
            {new Date(dates.from).toLocaleDateString()} →{" "}
            {new Date(dates.to).toLocaleDateString()}
          </p>

          {isMgr && (
            <p className="text-xs text-gray-400 mt-1">
              Employee: {employeeId}
            </p>
          )}
        </div>

        <div className="text-gray-400 text-sm">
          {durationDays} days
        </div>
      </div>
    </Link>
  );
}
