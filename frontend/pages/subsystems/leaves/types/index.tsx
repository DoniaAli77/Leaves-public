// pages/subsystems/leaves/types/index.tsx
import React, { useEffect, useState } from "react";
import LeaveCard from "@/components/leaves/cards/LeaveCard";
import LeaveTypeForm from "@/components/leaves/forms/LeaveTypeForm";
import DeleteConfirmModal from "@/components/leaves/modals/DeleteConfirmModal";

import {
  getLeaveTypes,
  createLeaveType,
  updateLeaveType,
  deleteLeaveType,
} from "@/services/leaves/leaveTypes.api";

import { getLeaveCategories } from "@/services/leaves/leaveCategories.api";

interface LeaveType {
  _id: string;
  name: string;
  code: string;
  description?: string;
  categoryId?: string;
}

interface LeaveCategory {
  _id: string;
  name: string;
}

export default function Page() {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [categories, setCategories] = useState<LeaveCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<LeaveType | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadLeaveTypes = async () => {
    try {
      setLoading(true);
      const res = await getLeaveTypes();
      setLeaveTypes(res.data || []);
    } catch (err) {
      console.error("Failed to load leave types", err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await getLeaveCategories();
      setCategories(res.data || []);
    } catch (err) {
      console.error("Failed to load categories", err);
    }
  };

  useEffect(() => {
    loadLeaveTypes();
    loadCategories();
  }, []);

  const handleSubmit = async (data: any) => {
    try {
      if (editing) {
        await updateLeaveType(editing._id, data);
      } else {
        await createLeaveType(data);
      }
      setShowForm(false);
      setEditing(null);
      await loadLeaveTypes();
    } catch (err) {
      console.error("Error submitting leave type", err);
      alert("Failed to save. See console for details.");
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteLeaveType(deleteId);
      setDeleteId(null);
      await loadLeaveTypes();
    } catch (err) {
      console.error("Error deleting leave type", err);
      alert("Failed to delete. See console.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-10 text-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-semibold">Leave Types</h1>
          <button
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl shadow-lg"
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
          >
            + Add Leave Type
          </button>
        </div>

        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : leaveTypes.length === 0 ? (
          <p className="text-gray-400">No leave types found.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leaveTypes.map((lt) => (
              <LeaveCard
                key={lt._id}
                name={lt.name}
                code={lt.code}
                description={lt.description}
                onEdit={() => {
                  setEditing(lt);
                  setShowForm(true);
                }}
                onDelete={() => setDeleteId(lt._id)}
              />
            ))}
          </div>
        )}

        {showForm && (
          <LeaveTypeForm
            onSubmit={handleSubmit}
            onClose={() => {
              setShowForm(false);
              setEditing(null);
            }}
            initialData={editing}
            categories={categories}
            mode={editing ? "edit" : "create"}
          />
        )}

        {deleteId && (
          <DeleteConfirmModal
            message="Are you sure you want to delete this leave type?"
            onCancel={() => setDeleteId(null)}
            onConfirm={confirmDelete}
          />
        )}
      </div>
    </div>
  );
}
