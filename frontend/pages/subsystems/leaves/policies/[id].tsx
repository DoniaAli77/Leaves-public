// frontend/pages/subsystems/leaves/policies/[id].tsx

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import LeavePolicyForm from "@/components/leaves/forms/LeavePolicyForm";
import { leavePolicyAPI } from "@/services/leaves/leavePolicies.api";

export default function EditPolicyPage() {
  const router = useRouter();
  const { id } = router.query;

  const [policy, setPolicy] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadPolicy = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const res = await leavePolicyAPI.getOne(id as string);
      setPolicy(res.data ?? res);
    } catch (err) {
      console.error("Failed to load policy", err);
      alert("Policy not found");
      router.push("/subsystems/leaves/policies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPolicy();
  }, [id]);

  const handleUpdate = async (data: any) => {
    try {
      setSaving(true);
      await leavePolicyAPI.update(id as string, data);
      router.push("/subsystems/leaves/policies");
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update policy.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this policy?")) return;

    try {
      await leavePolicyAPI.remove(id as string);
      router.push("/subsystems/leaves/policies");
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete policy.");
    }
  };

  if (loading)
    return (
      <div className="text-center text-white p-10">
        Loading policy...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-10 text-white">
      <div className="max-w-3xl mx-auto">

        <h1 className="text-4xl font-light mb-8">Edit Leave Policy</h1>

        <LeavePolicyForm
          mode="edit"
          initialData={policy}
          onSubmit={handleUpdate}
          onDelete={handleDelete}
          loading={saving}
          onClose={async () => { await router.push("/subsystems/leaves/policies"); }}
        />
      </div>
    </div>
  );
}