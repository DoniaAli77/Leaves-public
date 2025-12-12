import { useEffect, useState } from "react";
import Link from "next/link";
import { leavePolicyAPI } from "@/services/leaves/leavePolicies.api";

export default function LeavePoliciesList() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPolicies = async () => {
    try {
      setLoading(true);
      const res = await leavePolicyAPI.getAll();
      setPolicies(res.data || res);
    } catch (err) {
      console.error("LOAD ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPolicies();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white p-10">

      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-light">Leave Policies</h1>

          <Link
            href="/subsystems/leaves/policies/create"
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl text-white hover:opacity-90 transition"
          >
            Create New Policy
          </Link>
        </div>

        {/* Loading */}
        {loading && <p className="text-gray-300">Loading...</p>}

        {/* Empty */}
        {!loading && policies.length === 0 && (
          <p className="text-gray-400">No leave policies found.</p>
        )}

        {/* List */}
        <div className="space-y-4">
          {policies.map((p: any) => (
            <div
              key={p._id}
              className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-xl hover:border-white/20 transition"
            >
              <h2 className="text-xl">{p.policyType}</h2>

              <p className="text-gray-400 text-sm">
                {p.isActive ? "Active" : "Inactive"}
              </p>

              <p className="text-gray-400 text-sm">
                From: {p.effectiveFrom?.substring(0, 10)} — To:{" "}
                {p.effectiveTo?.substring(0, 10) || "No end date"}
              </p>

              <div className="mt-4 flex gap-3">
                <Link
                  href={`/subsystems/leaves/policies/${p._id}`}
                  className="text-cyan-400 hover:text-cyan-300"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
