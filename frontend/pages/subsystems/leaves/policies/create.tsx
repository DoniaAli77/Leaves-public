// frontend/pages/subsystems/leaves/policies/create.tsx

import React, { useState } from "react";
import { useRouter } from "next/router";
import LeavePolicyForm from "@/components/leaves/forms/LeavePolicyForm";
import { leavePolicyAPI } from "@/services/leaves/leavePolicies.api";

export default function CreatePolicyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    try {
      setLoading(true);
      await leavePolicyAPI.create(data);
      router.push("/subsystems/leaves/policies");
    } catch (err) {
      console.error("CREATE POLICY FAILED:", err);
      alert("Failed to create policy");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-10 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl mb-6">Create Leave Policy</h1>

        <LeavePolicyForm
          mode="create"
          loading={loading}
          onSubmit={handleSubmit}
          onClose={() => {router.push("/subsystems/leaves/policies");}}

        />
      </div>
    </div>
  );
}