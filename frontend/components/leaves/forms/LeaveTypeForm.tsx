// components/leaves/forms/LeaveTypeForm.tsx
import React, { useEffect, useState } from "react";

interface LeaveCategory {
  _id: string;
  name: string;
}

interface LeaveType {
  _id?: string;
  name?: string;
  code?: string;
  description?: string;
  categoryId?: string;

  // backend-managed fields
  paid?: boolean;
  deductible?: boolean;
  requiresAttachment?: boolean;
  attachmentType?: string | null;
  minTenureMonths?: number | null;
  maxDurationDays?: number | null;
}

interface Props {
  onSubmit: (data: any) => Promise<void>;
  onClose: () => void;
  initialData?: LeaveType | null;
  categories: LeaveCategory[];
  mode?: "create" | "edit";
}

/* CATEGORY → DEFAULT FIELD MAPPING */
const CATEGORY_DEFAULTS: Record<string, Partial<LeaveType>> = {
  Annual: {
    paid: true,
    deductible: false,
    requiresAttachment: false,
    attachmentType: null,
    minTenureMonths: 0,
    maxDurationDays: 30,
  },
  Sick: {
    paid: true,
    deductible: false,
    requiresAttachment: true,
    attachmentType: "medical_certificate",
    minTenureMonths: 0,
    maxDurationDays: 14,
  },
  Unpaid: {
    paid: false,
    deductible: false,
    requiresAttachment: false,
    attachmentType: null,
    minTenureMonths: 0,
    maxDurationDays: 365,
  },
  Maternity: {
    paid: true,
    deductible: false,
    requiresAttachment: true,
    attachmentType: "medical_certificate",
    minTenureMonths: 12,
    maxDurationDays: 120,
  },
  default: {
    paid: true,
    deductible: false,
    requiresAttachment: false,
    attachmentType: null,
    minTenureMonths: 0,
    maxDurationDays: 30,
  },
};

export default function LeaveTypeForm({
  onSubmit,
  onClose,
  initialData = null,
  categories,
  mode = "create",
}: Props) {
  // --- FORM STATE ---
  const [name, setName] = useState(initialData?.name ?? "");
  const [code, setCode] = useState(initialData?.code ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");

  // category
  const [categoryId, setCategoryId] = useState<string>(
    initialData?.categoryId ?? categories[0]?._id
  );

  // derived defaults
  const [categoryDefaults, setCategoryDefaults] = useState<Partial<LeaveType>>(
    CATEGORY_DEFAULTS.default
  );

  // update defaults when category changes
  useEffect(() => {
    const selectedCat = categories.find((c) => c._id === categoryId);
    const defaults =
      (selectedCat && CATEGORY_DEFAULTS[selectedCat.name]) ||
      CATEGORY_DEFAULTS.default;
    setCategoryDefaults(defaults);
  }, [categoryId, categories]);

  // --- SUBMIT HANDLER ---
  const handleSubmit = async () => {
    if (!name.trim() || !code.trim() || !categoryId) {
      alert("Name, Code and Category are required.");
      return;
    }

    const payload = {
      name: name.trim(),
      code: code.trim(),
      description: description.trim() || undefined,
      categoryId,

      // backend required fields (computed from category)
      paid: categoryDefaults.paid,
      deductible: categoryDefaults.deductible,
      requiresAttachment: categoryDefaults.requiresAttachment,
      attachmentType: categoryDefaults.attachmentType ?? undefined,
      minTenureMonths: categoryDefaults.minTenureMonths ?? undefined,
      maxDurationDays: categoryDefaults.maxDurationDays ?? undefined,
    };

    await onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="w-full max-w-2xl bg-slate-900 rounded-2xl border border-white/10 p-6">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">
            {mode === "edit" ? "Edit Leave Type" : "Create Leave Type"}
          </h3>
          <button onClick={onClose} className="text-gray-300 hover:text-white">✕</button>
        </div>

        {/* FORM FIELDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <label className="text-sm text-gray-300">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full p-2 rounded-md bg-white/5 border border-white/10 text-white"
            />
          </div>

          <div>
            <label className="text-sm text-gray-300">Code</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="mt-1 w-full p-2 rounded-md bg-white/5 border border-white/10 text-white"
            />
          </div>

          {/* CATEGORY SELECT */}
          <div className="md:col-span-2">
            <label className="text-sm text-gray-300">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={mode === "edit"} // can't change category while editing
              className="mt-1 w-full p-2 rounded-md bg-white/5 border border-white/10 text-white"
            >
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* DESCRIPTION */}
          <div className="md:col-span-2">
            <label className="text-sm text-gray-300">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 w-full p-2 rounded-md bg-white/5 border border-white/10 text-white"
            />
          </div>

        </div>

        {/* DEFAULTS */}
        <hr className="my-4 border-white/10" />

        <h4 className="text-sm text-gray-300 mb-2">Defaults (based on category)</h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">

          <div className="flex gap-3 items-center">
            <input type="checkbox" checked={!!categoryDefaults.paid} readOnly className="accent-cyan-400" />
            <span>Paid</span>
          </div>

          <div className="flex gap-3 items-center">
            <input type="checkbox" checked={!!categoryDefaults.deductible} readOnly className="accent-cyan-400" />
            <span>Deductible</span>
          </div>

          <div className="flex gap-3 items-center">
            <input type="checkbox" checked={!!categoryDefaults.requiresAttachment} readOnly className="accent-cyan-400" />
            <span>
              Requires Attachment{" "}
              {categoryDefaults.requiresAttachment && (
                <span className="text-gray-400 text-xs">
                  ({categoryDefaults.attachmentType})
                </span>
              )}
            </span>
          </div>

          <div>
            <div className="text-gray-400 text-xs">Min Tenure (months)</div>
            <div>{categoryDefaults.minTenureMonths ?? 0}</div>
          </div>

          <div>
            <div className="text-gray-400 text-xs">Max Duration (days)</div>
            <div>{categoryDefaults.maxDurationDays ?? "-"}</div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-md text-gray-300 border border-white/10">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2 rounded-md bg-gradient-to-r from-blue-600 to-cyan-500"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
