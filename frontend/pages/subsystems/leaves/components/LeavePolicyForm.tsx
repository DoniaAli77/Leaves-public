// frontend/components/leaves/LeavePolicyForm.tsx
import React, { useEffect, useState } from "react";

interface Props {
  initialData?: any;
  onSubmit: (data: any) => Promise<void> | void;
  loading?: boolean;
}

export default function LeavePolicyForm({ initialData, onSubmit, loading }: Props) {
  const [form, setForm] = useState({
    leaveTypeId: "",
    policyType: "",
    effectiveFrom: "",
    effectiveTo: "",
    isActive: true,
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        leaveTypeId: initialData.leaveTypeId || "",
        policyType: initialData.policyType || "",
        effectiveFrom: initialData.effectiveFrom ? initialData.effectiveFrom.split("T")[0] : "",
        effectiveTo: initialData.effectiveTo ? initialData.effectiveTo.split("T")[0] : "",
        isActive: initialData.isActive ?? true,
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 bg-white/5 border border-white/10 rounded-2xl">
      <h3 className="text-xl mb-4 text-white">{initialData ? "Edit Policy" : "Create Policy"}</h3>

      <label className="block mb-3 text-gray-300">
        Leave Type ID
        <input
          required
          className="w-full mt-2 p-2 rounded bg-white/10 border border-white/20 text-white"
          value={form.leaveTypeId}
          onChange={(e) => setForm({ ...form, leaveTypeId: e.target.value })}
        />
      </label>

      <label className="block mb-3 text-gray-300">
        Policy Type
        <input
          required
          className="w-full mt-2 p-2 rounded bg-white/10 border border-white/20 text-white"
          placeholder="Example: Accrual, CarryOver, MaxLimit"
          value={form.policyType}
          onChange={(e) => setForm({ ...form, policyType: e.target.value })}
        />
      </label>

      <div className="grid grid-cols-2 gap-4 mb-3">
        <label className="text-gray-300">
          Effective From
          <input
            type="date"
            className="w-full mt-2 p-2 rounded bg-white/10 border border-white/20 text-white"
            value={form.effectiveFrom}
            onChange={(e) => setForm({ ...form, effectiveFrom: e.target.value })}
          />
        </label>

        <label className="text-gray-300">
          Effective To
          <input
            type="date"
            className="w-full mt-2 p-2 rounded bg-white/10 border border-white/20 text-white"
            value={form.effectiveTo}
            onChange={(e) => setForm({ ...form, effectiveTo: e.target.value })}
          />
        </label>
      </div>

      <label className="flex items-center gap-3 mb-4 text-gray-300">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          className="w-4 h-4"
        />{" "}
        Active
      </label>

      <button
        type="submit"
        className="w-full py-2 rounded bg-gradient-to-r from-blue-600 to-cyan-500 text-white"
        disabled={loading}
      >
        {loading ? "Saving..." : (initialData ? "Update Policy" : "Create Policy")}
      </button>
    </form>
  );
}
