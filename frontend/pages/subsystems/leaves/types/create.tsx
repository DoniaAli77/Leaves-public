// pages/subsystems/leaves/types/create.tsx
import React, { useEffect, useState } from "react";
import LeaveTypeForm from "@/components/leaves/forms/LeaveTypeForm";
import { getLeaveCategories } from "@/services/leaves/leaveCategories.api";
import { createLeaveType } from "@/services/leaves/leaveTypes.api";
import { useRouter } from "next/router";

export default function CreatePage() {
  const [categories, setCategories] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    getLeaveCategories().then((r) => setCategories(r.data || [])).catch(console.error);
  }, []);

  const handleSubmit = async (data: any) => {
    await createLeaveType(data);
    router.push("/subsystems/leaves/types");
  };

  return (
    <div className="min-h-screen p-10 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl mb-6">Create Leave Type</h1>
        <LeaveTypeForm onSubmit={handleSubmit} onClose={() => router.push("/subsystems/leaves/types")} categories={categories} />
      </div>
    </div>
  );
}
