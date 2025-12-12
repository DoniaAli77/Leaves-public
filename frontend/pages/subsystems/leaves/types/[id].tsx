// pages/subsystems/leaves/types/[id].tsx
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import LeaveTypeForm from "@/components/leaves/forms/LeaveTypeForm";
import { getLeaveTypeById, updateLeaveType } from "@/services/leaves/leaveTypes.api";
import { getLeaveCategories } from "@/services/leaves/leaveCategories.api";

export default function EditPage() {
  const router = useRouter();
  const { id } = router.query;

  const [initialData, setInitialData] = useState<any | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const [tRes, cRes] = await Promise.all([
          getLeaveTypeById(String(id)),
          getLeaveCategories(),
        ]);
        setInitialData(tRes.data);
        setCategories(cRes.data || []);
      } catch (err) {
        console.error(err);
        alert("Failed to load leave type");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSubmit = async (data: any) => {
    if (!id) return;
    await updateLeaveType(String(id), data);
    router.push("/subsystems/leaves/types");
  };

  if (loading) return <div className="p-10 text-white">Loading...</div>;
  if (!initialData) return <div className="p-10 text-white">Leave type not found</div>;

  return (
    <div className="min-h-screen p-10 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl mb-6">Edit Leave Type</h1>
        <LeaveTypeForm onSubmit={handleSubmit} onClose={() => router.push("/subsystems/leaves/types")} initialData={initialData} categories={categories} mode="edit" />
      </div>
    </div>
  );
}
