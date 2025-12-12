// components/leaves/LeaveTypeForm.tsx
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
  // backend fields (read-only defaults per category)
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

/**
 * Default mapping of category name -> default leave type settings.
 * Admin cannot override these defaults (fields shown but disabled).
 * Extend this mapping as needed.
 */
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
  // fallback defaults
  default: {
    paid: true,
    deductible: false,
    requiresAttachment: false,
    attachmentType: null,
    minTenureMonths: 0,
    maxDurationDays: 30,
  },
};

export default function LeaveTypeForm({ onSubmit, onClose, initialData = null, categories, mode = "create" }: Props) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [code, setCode] = useState(initialData?.code ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [categoryId, setCategoryId] = useState<string | undefined>(initialData?.categoryId ?? (categories[0]?._id));
  const [categoryDefaults, setCategoryDefaults] = useState<Partial<LeaveType>>({});

  useEffect(() => {
    // when initialData loads or categories change, set defaults
    if (initialData?.categoryId) {
      const cat = categories.find((c) => c._id === initialData.categoryId);
      const defaults = (cat && CATEGORY_DEFAULTS[cat.name]) ?? CATEGORY_DEFAULTS.default;
      setCategoryDefaults({ ...defaults });
    } else if (categoryId) {
      const cat = categories.find((c) => c._id === categoryId);
      const defaults = (cat && CATEGORY_DEFAULTS[cat.name]) ?? CATEGORY_DEFAULTS.default;
      setCategoryDefaults({ ...defaults });
    } else {
      setCategoryDefaults(CATEGORY_DEFAULTS.default);
    }
  }, [initialData, categoryId, categories]);

  useEffect(() => {
    // if initialData provided, prefill checked values (but keep fields disabled)
    if (initialData) {
      setName(initialData.name ?? "");
      setCode(initialData.code ?? "");
      setDescription(initialData.description ?? "");
      setCategoryId(initialData.categoryId ?? categoryId);
    }
  }, [initialData]);

  const handleSubmit = async () => {
    if (!name.trim() || !code.trim() || !categoryId) {
      alert("Please fill name, code and category");
      return;
    }

    // payload includes required categoryId and defaulted properties from category
    const payload: any = {
      name: name.trim(),
      code: code.trim(),
      categoryId,
      description: description.trim() || undefined,
      // include defaults (admin cannot override them via UI)
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
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-white">{mode === "edit" ? "Edit Leave Type" : "Create Leave Type"}</h3>
          <button onClick={onClose} className="text-gray-300">Close</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-300">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full p-2 rounded-md bg-white/5 border border-white/10 text-white" />
          </div>

          <div>
            <label className="text-sm text-gray-300">Code</label>
            <input value={code} onChange={(e) => setCode(e.target.value)}
              className="mt-1 w-full p-2 rounded-md bg-white/5 border border-white/10 text-white" />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm text-gray-300">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="mt-1 w-full p-2 rounded-md bg-white/5 border border-white/10 text-white"
              disabled={!!initialData} // if editing, category stays fixed
            >
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm text-gray-300">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full p-2 rounded-md bg-white/5 border border-white/10 text-white" rows={3} />
          </div>
        </div>

        <hr className="my-4 border-white/10" />

        {/* Read-only defaults derived from category */}
        <div>
          <h4 className="text-sm text-gray-300 mb-2">Default Settings (from selected category)</h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <input type="checkbox" checked={!!categoryDefaults.paid} readOnly className="accent-cyan-400" />
              <div>
                <div className="text-sm text-white">Paid</div>
                <div className="text-xs text-gray-400">Whether the leave is paid</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input type="checkbox" checked={!!categoryDefaults.deductible} readOnly className="accent-cyan-400" />
              <div>
                <div className="text-sm text-white">Deductible</div>
                <div className="text-xs text-gray-400">Counts against allowance</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input type="checkbox" checked={!!categoryDefaults.requiresAttachment} readOnly className="accent-cyan-400" />
              <div>
                <div className="text-sm text-white">Requires Attachment</div>
                <div className="text-xs text-gray-400">
                  {categoryDefaults.requiresAttachment ? `Type: ${categoryDefaults.attachmentType ?? "file"}` : "No"}
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm text-white">Min tenure (months)</div>
              <div className="text-xs text-gray-400">{categoryDefaults.minTenureMonths ?? 0}</div>
            </div>

            <div>
              <div className="text-sm text-white">Max duration (days)</div>
              <div className="text-xs text-gray-400">{categoryDefaults.maxDurationDays ?? "-"}</div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-md text-gray-300 bg-transparent border border-white/10">Cancel</button>
          <button onClick={handleSubmit} className="px-5 py-2 rounded-md bg-gradient-to-r from-blue-600 to-cyan-500 text-white">Save</button>
        </div>
      </div>
    </div>
  );
}
