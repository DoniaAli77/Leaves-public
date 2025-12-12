import React from "react";

interface LeaveCategory {
  _id: string;
  name: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  categories: LeaveCategory[];
}

export default function CategoryDrawer({ open, onClose, categories }: Props) {
  return (
    <div>
      {/* BACKDROP */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* SIDE DRAWER */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-slate-900 border-r border-white/10 text-white z-50 transform transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Categories</h2>
          <button onClick={onClose} className="text-gray-300 hover:text-white">
            ✕
          </button>
        </div>

        <ul className="p-4 space-y-3">
          {categories.map((cat) => (
            <li
              key={cat._id}
              className="p-2 rounded bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer"
            >
              {cat.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
