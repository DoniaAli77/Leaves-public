import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { isAdmin } from "@/utils/roles";

interface Props {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onDelete?: () => void | Promise<void>;
  mode?: "create" | "edit";
  loading?: boolean;
  onClose?: () => void | Promise<void>;
}

export default function LeavePolicyForm({
  initialData,
  onSubmit,
  onDelete,
  mode = "create",
  loading = false,
  onClose,
}: Props) {
  const { user } = useAuth();

  // 🔒 Admin-only (UX guard)
  if (!isAdmin(user?.roles)) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-slate-900 border border-white/10 p-6 rounded-xl text-red-400">
          Unauthorized – Admin access required
        </div>
      </div>
    );
  }

  const [form, setForm] = useState({
    policyType: "STANDARD",
    leaveTypeId: "",
    isActive: true,
    minServiceMonths: "",
    maxServiceMonths: "",
    effectiveFrom: "",
    effectiveTo: "",
    maxDaysPerRequest: "",
    maxRequestsPerYear: "",
    carryForwardAllowed: false,
    carryForwardLimit: "",
  });

  // 🟡 Load data on EDIT
  useEffect(() => {
    if (!initialData) return;

    setForm({
      policyType: initialData.policyType ?? "STANDARD",
      leaveTypeId: initialData.leaveTypeId ?? "",
      isActive: initialData.isActive ?? true,
      minServiceMonths: initialData.minServiceMonths?.toString() ?? "",
      maxServiceMonths: initialData.maxServiceMonths?.toString() ?? "",
      effectiveFrom: initialData.effectiveFrom?.split("T")[0] ?? "",
      effectiveTo: initialData.effectiveTo?.split("T")[0] ?? "",
      maxDaysPerRequest: initialData.maxDaysPerRequest?.toString() ?? "",
      maxRequestsPerYear: initialData.maxRequestsPerYear?.toString() ?? "",
      carryForwardAllowed: initialData.carryForwardAllowed ?? false,
      carryForwardLimit: initialData.carryForwardLimit?.toString() ?? "",
    });
  }, [initialData]);

  const input =
    "mt-1 w-full p-2 rounded bg-slate-800 border border-white/10 text-white";

  const handleChange = (key: string, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // ✅ EXACT backend payload
  const handleSubmit = async () => {
    if (loading) return;

    const payload = {
      policyType: form.policyType,
      leaveTypeId: form.leaveTypeId,
      isActive: form.isActive,
      minServiceMonths: Number(form.minServiceMonths),
      maxServiceMonths: Number(form.maxServiceMonths),
      effectiveFrom: form.effectiveFrom || null,
      effectiveTo: form.effectiveTo || null,
      maxDaysPerRequest: Number(form.maxDaysPerRequest),
      maxRequestsPerYear: Number(form.maxRequestsPerYear),
      carryForwardAllowed: form.carryForwardAllowed,
      carryForwardLimit: Number(form.carryForwardLimit),
    };

    await onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
      <div className="w-full max-w-3xl bg-slate-900 border border-white/10 p-6 rounded-2xl">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h3 className="text-xl text-white font-semibold">
            {mode === "edit" ? "Edit Leave Policy" : "Create Leave Policy"}
          </h3>
          {onClose && (
            <button className="text-gray-300" onClick={onClose}>
              Close
            </button>
          )}
        </div>

        {/* FORM */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">

          <div>
            <label className="text-sm text-gray-300">Policy Type</label>
            <select
              className={input}
              value={form.policyType}
              onChange={(e) => handleChange("policyType", e.target.value)}
            >
              <option value="STANDARD">STANDARD</option>
              <option value="SPECIAL">SPECIAL</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-300">Leave Type ID</label>
            <input
              className={input}
              value={form.leaveTypeId}
              onChange={(e) => handleChange("leaveTypeId", e.target.value)}
            />
          </div>

          <label className="flex items-center gap-3 mt-2 text-gray-300">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => handleChange("isActive", e.target.checked)}
            />
            Active
          </label>

          <div>
            <label className="text-sm text-gray-300">Min Service Months</label>
            <input
              type="number"
              className={input}
              value={form.minServiceMonths}
              onChange={(e) =>
                handleChange("minServiceMonths", e.target.value)
              }
            />
          </div>

          <div>
            <label className="text-sm text-gray-300">Max Service Months</label>
            <input
              type="number"
              className={input}
              value={form.maxServiceMonths}
              onChange={(e) =>
                handleChange("maxServiceMonths", e.target.value)
              }
            />
          </div>

          <div>
            <label className="text-sm text-gray-300">Effective From</label>
            <input
              type="date"
              className={input}
              value={form.effectiveFrom}
              onChange={(e) =>
                handleChange("effectiveFrom", e.target.value)
              }
            />
          </div>

          <div>
            <label className="text-sm text-gray-300">Effective To</label>
            <input
              type="date"
              className={input}
              value={form.effectiveTo}
              onChange={(e) =>
                handleChange("effectiveTo", e.target.value)
              }
            />
          </div>

          <div>
            <label className="text-sm text-gray-300">
              Max Days Per Request
            </label>
            <input
              type="number"
              className={input}
              value={form.maxDaysPerRequest}
              onChange={(e) =>
                handleChange("maxDaysPerRequest", e.target.value)
              }
            />
          </div>

          <div>
            <label className="text-sm text-gray-300">
              Max Requests Per Year
            </label>
            <input
              type="number"
              className={input}
              value={form.maxRequestsPerYear}
              onChange={(e) =>
                handleChange("maxRequestsPerYear", e.target.value)
              }
            />
          </div>

          <label className="flex items-center gap-3 mt-2 text-gray-300">
            <input
              type="checkbox"
              checked={form.carryForwardAllowed}
              onChange={(e) =>
                handleChange("carryForwardAllowed", e.target.checked)
              }
            />
            Allow Carry Forward
          </label>

          <div>
            <label className="text-sm text-gray-300">
              Carry Forward Limit
            </label>
            <input
              type="number"
              className={input}
              value={form.carryForwardLimit}
              onChange={(e) =>
                handleChange("carryForwardLimit", e.target.value)
              }
            />
          </div>
        </div>

        {/* ACTIONS */}
        <div className="mt-8 flex justify-end gap-4">
          {mode === "edit" && onDelete && (
            <button
              onClick={onDelete}
              className="px-5 py-2 bg-red-600 text-white rounded-md"
            >
              Delete
            </button>
          )}

          {onClose && (
            <button
              className="px-5 py-2 text-gray-300 border border-white/10 rounded-md"
              onClick={onClose}
            >
              Cancel
            </button>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-md disabled:opacity-50"
          >
            {loading
              ? "Saving..."
              : mode === "edit"
              ? "Update Policy"
              : "Create Policy"}
          </button>
        </div>
      </div>
    </div>
  );
}
