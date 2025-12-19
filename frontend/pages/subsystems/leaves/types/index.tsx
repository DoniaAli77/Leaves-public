import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import { FiMenu } from "react-icons/fi";

import LeaveCard from "@/components/leaves/cards/LeaveCard";
import LeaveTypeForm from "@/components/leaves/forms/LeaveTypeForm";
import DeleteConfirmModal from "@/components/leaves/modals/DeleteConfirmModal";
import CategoryDrawer from "@/components/leaves/modals/CategoryDrawer";

import {
  getLeaveTypes,
  createLeaveType,
  updateLeaveType,
  deleteLeaveType,
} from "@/services/leaves/leaveTypes.api";

import { getLeaveCategories } from "@/services/leaves/leaveCategories.api";
import { useAuth } from "@/hooks/useAuth";
import { isAdmin } from "@/utils/roles";

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

function Page() {
  const { user } = useAuth();
  const canManageLeaveTypes = isAdmin(user?.roles);

  // ⛔ WAIT FOR USER, THEN HARD BLOCK NON-ADMINS
  if (!user) return null;

  if (!canManageLeaveTypes) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-semibold mb-4">
            Access Restricted
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Only{" "}
            <span className="text-cyan-400 font-medium">
              HR Administrators
            </span>{" "}
            are allowed to view and manage leave types.
          </p>
        </div>
      </div>
    );
  }

  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [categories, setCategories] = useState<LeaveCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<LeaveType | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const loadLeaveTypes = async () => {
    try {
      setLoading(true);
      const res = await getLeaveTypes();
      setLeaveTypes(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    const res = await getLeaveCategories();
    setCategories(res.data || []);
  };

  useEffect(() => {
    loadLeaveTypes();
    loadCategories();
  }, []);

  const handleSubmit = async (data: any) => {
    if (editing) {
      await updateLeaveType(editing._id, data);
    } else {
      await createLeaveType(data);
    }

    setShowForm(false);
    setEditing(null);
    loadLeaveTypes();
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    await deleteLeaveType(deleteId);
    setDeleteId(null);
    loadLeaveTypes();
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-10 text-white">
      <button
        className="absolute top-6 left-6 text-white text-3xl hover:text-cyan-400 transition"
        onClick={() => setDrawerOpen(true)}
      >
        <FiMenu />
      </button>

      <CategoryDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        categories={categories}
      />

      <div className="max-w-6xl mx-auto mt-10">
        <div className="flex justify-between items-center mb-8">
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

export default dynamic(() => Promise.resolve(Page), { ssr: false });
