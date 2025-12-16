import React, { useEffect, useState } from "react";

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
  const [form, setForm] = useState({
    leaveTypeId: "",
    policyType: "",
    accrualMethod: "MONTHLY",
    monthlyRate: "",
    yearlyRate: "",
    carryForwardAllowed: false,
    maxCarryForward: "",
    roundingRule: "NONE",
    minNoticeDays: "",
    maxConsecutiveDays: "",
  });

  // Load initial values on edit
  useEffect(() => {
    if (!initialData) return;

    setForm({
      leaveTypeId: initialData.leaveTypeId?.toString() ?? "",
      policyType: initialData.policyType ?? "",
      accrualMethod: initialData.accrualMethod ?? "MONTHLY",
      monthlyRate: initialData.monthlyRate?.toString() ?? "",
      yearlyRate: initialData.yearlyRate?.toString() ?? "",
      carryForwardAllowed: initialData.carryForwardAllowed ?? false,
      maxCarryForward: initialData.maxCarryForward?.toString() ?? "",
      roundingRule: initialData.roundingRule ?? "NONE",
      minNoticeDays: initialData.minNoticeDays?.toString() ?? "",
      maxConsecutiveDays: initialData.maxConsecutiveDays?.toString() ?? "",
    });
  }, [initialData]);

  const input =
    "mt-1 w-full p-2 rounded bg-slate-800 border border-white/10 text-white";

  const handleChange = (key: string, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (loading) return;
    const payload = {
      leaveTypeId: form.leaveTypeId,
      policyType: form.policyType,
      accrualMethod: form.accrualMethod,
      monthlyRate: Number(form.monthlyRate) || 0,
      yearlyRate: Number(form.yearlyRate) || 0,
      carryForwardAllowed: form.carryForwardAllowed,
      maxCarryForward: Number(form.maxCarryForward) || 0,
      roundingRule: form.roundingRule,
      minNoticeDays: Number(form.minNoticeDays) || 0,
      maxConsecutiveDays: Number(form.maxConsecutiveDays) || 0,
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

        {/* FORM GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">

          {/* Leave Type ID */}
          <div>
            <label className="text-sm text-gray-300">Leave Type ID</label>
            <input
              className={input}
              value={form.leaveTypeId}
              onChange={(e) => handleChange("leaveTypeId", e.target.value)}
            />
          </div>

          {/* Policy Type */}
          <div>
            <label className="text-sm text-gray-300">Policy Type</label>
            <input
              className={input}
              value={form.policyType}
              onChange={(e) => handleChange("policyType", e.target.value)}
            />
          </div>

          {/* Accrual Method */}
          <div>
            <label className="text-sm text-gray-300">Accrual Method</label>
            <select
              className={input}
              value={form.accrualMethod}
              onChange={(e) => handleChange("accrualMethod", e.target.value)}
            >
              <option value="MONTHLY">Monthly</option>
              <option value="ANNUAL">Annual</option>
              <option value="NONE">None</option>
            </select>
          </div>

          {/* Monthly Rate */}
          <div>
            <label className="text-sm text-gray-300">Monthly Rate</label>
            <input
              type="number"
              className={input}
              value={form.monthlyRate}
              onChange={(e) => handleChange("monthlyRate", e.target.value)}
            />
          </div>

          {/* Yearly Rate */}
          <div>
            <label className="text-sm text-gray-300">Yearly Rate</label>
            <input
              type="number"
              className={input}
              value={form.yearlyRate}
              onChange={(e) => handleChange("yearlyRate", e.target.value)}
            />
          </div>

          {/* Carry Forward Allowed */}
          <div className="flex items-center gap-3 mt-2">
            <input
              type="checkbox"
              checked={form.carryForwardAllowed}
              onChange={(e) =>
                handleChange("carryForwardAllowed", e.target.checked)
              }
            />
            <label className="text-gray-300">Allow Carry Forward</label>
          </div>

          {/* Max Carry Forward */}
          <div>
            <label className="text-sm text-gray-300">Max Carry Forward</label>
            <input
              type="number"
              className={input}
              value={form.maxCarryForward}
              onChange={(e) => handleChange("maxCarryForward", e.target.value)}
            />
          </div>

          {/* Rounding Rule */}
          <div>
            <label className="text-sm text-gray-300">Rounding Rule</label>
            <select
            className={input}
            value={form.roundingRule}
            onChange={(e) => handleChange("roundingRule", e.target.value)}
          >
            <option value="NONE">None</option>
            <option value="ROUND_UP">Round Up</option>
            <option value="ROUND_DOWN">Round Down</option>
            <option value="ROUND">Round</option>
          </select>
          </div>

          {/* Min Notice Days */}
          <div>
            <label className="text-sm text-gray-300">Min Notice Days</label>
            <input
              type="number"
              className={input}
              value={form.minNoticeDays}
              onChange={(e) => handleChange("minNoticeDays", e.target.value)}
            />
          </div>

          {/* Max Consecutive Days */}
          <div>
            <label className="text-sm text-gray-300">Max Consecutive Days</label>
            <input
              type="number"
              className={input}
              value={form.maxConsecutiveDays}
              onChange={(e) =>
                handleChange("maxConsecutiveDays", e.target.value)
              }
            />
          </div>

        </div>

        {/* ACTION BUTTONS */}
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
            {loading ? "Saving..." : mode === "edit" ? "Update Policy" : "Create Policy"}
          </button>
        </div>
      </div>
    </div>
  );
}
