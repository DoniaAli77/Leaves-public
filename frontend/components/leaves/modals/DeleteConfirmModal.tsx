// components/leaves/DeleteConfirmModal.tsx
import React from "react";

interface Props {
  message?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmModal({ message = "Are you sure?", onCancel, onConfirm }: Props) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-900 p-6 rounded-2xl w-[420px] border border-white/10">
        <h3 className="text-xl font-semibold text-white mb-4">Confirm delete</h3>
        <p className="text-gray-300">{message}</p>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 rounded-md text-gray-300">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-md bg-rose-500 text-white">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
