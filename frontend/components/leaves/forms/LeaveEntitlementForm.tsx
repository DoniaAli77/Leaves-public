import { useState } from "react";

export default function LeaveEntitlementForm({
  initialData = {},
  onSubmit,
  onClose,
}: any) {
  const [form, setForm] = useState({
    totalDays: initialData.totalDays ?? 0,
    usedDays: initialData.usedDays ?? 0,
    pendingDays: initialData.pendingDays ?? 0,
  });

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-800 p-6 rounded-xl w-full max-w-md">
        <h2 className="text-xl text-white font-semibold mb-4">
          Edit Entitlement
        </h2>

        <input
          type="number"
          placeholder="Total Days"
          className="w-full mb-3 p-2 rounded bg-slate-700"
          value={form.totalDays}
          onChange={(e) =>
            setForm({ ...form, totalDays: Number(e.target.value) })
          }
        />

        <input
          type="number"
          placeholder="Used Days"
          className="w-full mb-3 p-2 rounded bg-slate-700"
          value={form.usedDays}
          onChange={(e) =>
            setForm({ ...form, usedDays: Number(e.target.value) })
          }
        />

        <input
          type="number"
          placeholder="Pending Days"
          className="w-full mb-3 p-2 rounded bg-slate-700"
          value={form.pendingDays}
          onChange={(e) =>
            setForm({ ...form, pendingDays: Number(e.target.value) })
          }
        />

        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>

          <button
            onClick={() => onSubmit(form)}
            className="px-4 py-2 bg-green-600 rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
