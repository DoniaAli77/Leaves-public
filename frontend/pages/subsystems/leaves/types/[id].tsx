import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import LeaveTypeForm from "@/components/leaves/forms/LeaveTypeForm";
import { getLeaveTypeById, updateLeaveType } from "@/services/leaves/leaveTypes.api";
import { getLeaveCategories } from "@/services/leaves/leaveCategories.api";
import { useAuth } from "@/hooks/useAuth";
import { isAdmin } from "@/utils/roles";

function EditPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;

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

  const [initialData, setInitialData] = useState<any | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [tRes, cRes] = await Promise.all([
          getLeaveTypeById(String(id)),
          getLeaveCategories(),
        ]);
        setInitialData(tRes.data);
        setCategories(cRes.data || []);
      } catch {
        router.push("/subsystems/leaves/types");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router]);

  const handleSubmit = async (data: any) => {
    await updateLeaveType(String(id), data);
    router.push("/subsystems/leaves/types");
  };

  if (loading) return <p className="text-white p-10">Loading...</p>;
  if (!initialData) return null;

  return (
    <div className="min-h-screen p-10 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl mb-6">Edit Leave Type</h1>
        <LeaveTypeForm
          onSubmit={handleSubmit}
          onClose={() => router.push("/subsystems/leaves/types")}
          initialData={initialData}
          categories={categories}
          mode="edit"
        />
      </div>
    </div>
  );
}

export default dynamic(() => Promise.resolve(EditPage), { ssr: false });
