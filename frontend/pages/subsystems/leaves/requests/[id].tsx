import React, { useEffect, useState } from "react";
import { getLeaveRequestById } from "@/services/leaves/leaveRequests.api";
import { useRouter } from "next/router";

export default function RequestDetailsPage() {
  const router = useRouter();
  const { id } = router.query;

  const [req, setReq] = useState<any>(null);

  useEffect(() => {
    if (id) {
      getLeaveRequestById(id as string).then((res) => setReq(res.data));
    }
  }, [id]);

  if (!req) return <p className="text-white p-10">Loading...</p>;

  return (
    <div className="min-h-screen p-10 bg-slate-900 text-white">
      <div className="max-w-xl mx-auto bg-slate-800 p-6 rounded-xl">

        <h1 className="text-3xl font-semibold mb-4">Leave Request</h1>

        <p><strong>Status:</strong> {req.status}</p>
        <p><strong>Employee:</strong> {req.employeeId}</p>

        <p className="mt-4">
          <strong>Dates:</strong><br />
          {new Date(req.dates.from).toLocaleDateString()} →{" "}
          {new Date(req.dates.to).toLocaleDateString()}
        </p>

        <p className="mt-4">
          <strong>Justification:</strong><br />
          {req.justification || "—"}
        </p>

      </div>
    </div>
  );
}
