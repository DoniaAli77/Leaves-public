import React from "react";

interface LeaveCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  isActive?: boolean;
  onClick?: () => void;
}

export default function LeaveCard({
  title,
  subtitle,
  description,
  isActive = true,
  onClick,
}: LeaveCardProps) {
  return (
    <div
      onClick={onClick}
      className="border rounded-md p-4 shadow-sm cursor-pointer hover:shadow-md transition bg-white"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">{title}</h2>

        <span
          className={
            "px-2 py-1 text-xs rounded " +
            (isActive
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700")
          }
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      </div>

      {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}

      {description && (
        <p className="text-gray-500 mt-2 text-sm leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
