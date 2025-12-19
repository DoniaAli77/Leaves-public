import React from "react";
import { ChevronRight, Trash2, Edit3 } from "lucide-react";

interface Props {
  name: string;
  code?: string;
  description?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function LeaveCard({
  name,
  code,
  description,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="relative bg-white/5 border border-white/10 rounded-2xl p-5 hover:shadow-lg transition-all">
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1">
          <div className="flex items-baseline gap-3">
            <h3 className="text-lg font-semibold text-white">{name}</h3>
            {code && (
              <span className="text-xs px-2 py-1 bg-white/5 rounded text-gray-300">
                {code}
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-gray-400 mt-2">{description}</p>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-2 rounded-md bg-white/3 hover:bg-white/5"
              aria-label="Edit"
            >
              <Edit3 className="w-4 h-4 text-cyan-300" />
            </button>
          )}

          {onDelete && (
            <button
              onClick={onDelete}
              className="p-2 rounded-md bg-white/3 hover:bg-white/5"
              aria-label="Delete"
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end text-sm text-cyan-300 gap-1">
        Learn more <ChevronRight className="w-4 h-4" />
      </div>
    </div>
  );
}
