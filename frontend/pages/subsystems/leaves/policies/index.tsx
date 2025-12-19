import React, { useEffect, useState } from "react";
import PolicyCard from "@/components/leaves/cards/PolicyCard";
import LeavePolicyForm from "@/components/leaves/forms/LeavePolicyForm";
import DeleteConfirmModal from "@/components/leaves/modals/DeleteConfirmModal";
import { leavePolicyAPI } from "@/services/leaves/leavePolicies.api";
import { useAuth } from "@/hooks/useAuth";
import { isAdmin } from "@/utils/roles";

export default function LeavePoliciesPage() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  const canManagePolicies = mounted && isAdmin(user?.roles);

  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadPolicies = async () => {
    try {
      setLoading(true);
      const res = await leavePolicyAPI.getAll();
      setPolicies(res.data || []);
    } catch (err) {
      console.error("Failed to load policies", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPolicies();
  }, []);

  const handleSubmit = async (data: any) => {
    try {
      if (editing) {
        await leavePolicyAPI.update(editing._id, data);
      } else {
        await leavePolicyAPI.create(data);
      }
      setShowForm(false);
      setEditing(null);
      loadPolicies();
    } catch (err) {
      alert("Failed to save policy.");
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await leavePolicyAPI.remove(deleteId);
      setDeleteId(null);
      loadPolicies();
    } catch (err) {
      alert("Failed to delete policy.");
    }
  };

  // ⛔ Prevent SSR mismatch
  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-10 text-white">
      <div className="max-w-6xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-semibold">Leave Policies</h1>

          {canManagePolicies && (
            <button
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl shadow-lg"
              onClick={() => {
                setEditing(null);
                setShowForm(true);
              }}
            >
              + Add Policy
            </button>
          )}
        </div>

        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : policies.length === 0 ? (
          <p className="text-gray-400">No leave policies found.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {policies.map((p) => (
              <PolicyCard
                key={p._id}
                {...p}
                onEdit={
                  canManagePolicies
                    ? () => {
                        setEditing(p);
                        setShowForm(true);
                      }
                    : undefined
                }
                onDelete={
                  canManagePolicies
                    ? () => setDeleteId(p._id)
                    : undefined
                }
              />
            ))}
          </div>
        )}

        {showForm && canManagePolicies && (
          <LeavePolicyForm
            mode={editing ? "edit" : "create"}
            initialData={editing}
            onSubmit={handleSubmit}
            onClose={() => {
              setShowForm(false);
              setEditing(null);
            }}
          />
        )}

        {deleteId && canManagePolicies && (
          <DeleteConfirmModal
            message="Are you sure you want to delete this policy?"
            onCancel={() => setDeleteId(null)}
            onConfirm={confirmDelete}
          />
        )}
      </div>
    </div>
  );
}
