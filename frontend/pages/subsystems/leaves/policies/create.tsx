// frontend/pages/subsystems/leaves/policies/create.tsx
import { useRouter } from "next/router";
import LeavePolicyForm from "../components/LeavePolicyForm";
import { leavePolicyAPI } from "@/services/leaves/leavePolicies.api";
import { useState } from "react";

export default function CreatePolicyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      await leavePolicyAPI.create(data);
      router.push("/subsystems/leaves/policies");
    } catch (err) {
      console.error("Create failed:", err);
      alert("Failed to create policy. See console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl mb-4">Create New Policy</h1>
        <LeavePolicyForm onSubmit={onSubmit} loading={loading} />
      </div>
    </div>
  );
}
