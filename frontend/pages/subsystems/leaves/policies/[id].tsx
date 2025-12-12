import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { leavePolicyAPI } from "@/services/leaves/leavePolicies.api";
import LeavePolicyForm from "@/pages/subsystems/leaves/components/LeavePolicyForm";

export default function EditPolicyPage() {
  const router = useRouter();
  const { id } = router.query;

  const [policy, setPolicy] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadPolicy = async () => {
    try {
      setLoading(true);
      const res = await leavePolicyAPI.getOne(id as string);
      setPolicy(res.data || res);
    } catch (err) {
      console.error("LOAD ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadPolicy();
  }, [id]);

  const handleUpdate = async (data: any) => {
    await leavePolicyAPI.update(id as string, data);
    router.push("/subsystems/leaves/policies");
  };

  const handleDelete = async () => {
    await leavePolicyAPI.remove(id as string);
    router.push("/subsystems/leaves/policies");
  };

  if (loading) return <p className="p-10 text-white">Loading...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white p-10">
      <div className="max-w-3xl mx-auto">

        <h1 className="text-4xl font-light mb-8">Edit Leave Policy</h1>

        <LeavePolicyForm initialData={policy} onSubmit={handleUpdate} />

        <button
          onClick={handleDelete}
          className="mt-6 px-4 py-2 bg-red-600 rounded-xl hover:bg-red-700 transition"
        >
          Delete Policy
        </button>

      </div>
    </div>
  );
}
