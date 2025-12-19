import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import LeaveTypeForm from "@/components/leaves/forms/LeaveTypeForm";
import { getLeaveCategories } from "@/services/leaves/leaveCategories.api";
import { createLeaveType } from "@/services/leaves/leaveTypes.api";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";
import { isAdmin } from "@/utils/roles";

function CreatePage() {
  const { user } = useAuth();
  const router = useRouter();

  if (user && !isAdmin(user.roles)) {
    return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
    <div className="text-center max-w-md">
      <h2 className="text-2xl font-semibold mb-4">
        Access Restricted
      </h2>
      <p className="text-gray-300 leading-relaxed">
        Only <span className="text-cyan-400 font-medium">HR Administrators</span> are
        allowed to view and manage leave types.
      </p>
    </div>
  </div>
);
  }

  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    getLeaveCategories()
      .then((r) => setCategories(r.data || []))
      .catch(console.error);
  }, []);

  const handleSubmit = async (data: any) => {
    await createLeaveType(data);
    router.push("/subsystems/leaves/types");
  };

  return (
    <div className="min-h-screen p-10 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl mb-6">Create Leave Type</h1>
        <LeaveTypeForm
          onSubmit={handleSubmit}
          onClose={() => router.push("/subsystems/leaves/types")}
          categories={categories}
        />
      </div>
    </div>
  );
}

export default dynamic(() => Promise.resolve(CreatePage), { ssr: false });
