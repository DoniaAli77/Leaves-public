// pages/subsystems/leaves/calendar/create.tsx
import React, { useState } from "react";
import { useRouter } from "next/router";
import { ArrowLeft, Save } from "lucide-react";
import axios from "@/utils/axiosInstance";
import { useAuth } from "@/hooks/useAuth";
import { isAdmin } from "@/utils/roles";

export default function CreateCalendarPage() {
  const router = useRouter();
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { user } = useAuth();

if (!isAdmin(user?.roles)) {
  return (
    <div className="min-h-screen flex items-center justify-center text-red-400">
      Unauthorized – Admin only
    </div>
  );
}

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await axios.post("/calendar", {
        year,
        holidays: [],
        blockedPeriods: [],
      });

      // ✅ backend route is GET calendar/:year
      router.push(`/subsystems/leaves/calendar/${year}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error creating calendar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-10">
      <div className="max-w-2xl mx-auto">

        <button
          onClick={() => router.push("/subsystems/leaves/calendar")}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h1 className="text-3xl font-bold text-white mb-6">
            Create Calendar
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full p-3 rounded bg-slate-800 text-white"
            >
              {[2024, 2025, 2026, 2027, 2028].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            {error && (
              <p className="text-red-400">{error}</p>
            )}

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.push("/subsystems/leaves/calendar")}
                className="flex-1 py-3 bg-white/5 rounded text-gray-300"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 rounded text-white"
              >
                {loading ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
