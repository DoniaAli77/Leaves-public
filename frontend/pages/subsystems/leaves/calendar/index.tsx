// pages/subsystems/leaves/calendar/index.tsx
import React, { useState } from "react";
import { useRouter } from "next/router";
import { Calendar, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { isAdmin } from "@/utils/roles";

export default function CalendarIndexPage() {
  const router = useRouter();
  const [year, setYear] = useState(new Date().getFullYear());
const { user } = useAuth();
const admin = isAdmin(user?.roles);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-10 text-white">
      <div className="max-w-xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-semibold flex items-center gap-3">
            <Calendar className="w-8 h-8 text-cyan-400" />
            Calendar Management
          </h1>
        </div>

        {/* CREATE BUTTON */}
        {admin && (
        <button
            onClick={() => router.push("/subsystems/leaves/calendar/create")}
            className="w-full mb-6 px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center gap-2 hover:opacity-90"
        >
            <Plus className="w-5 h-5" />
            Create New Calendar
        </button>
        )}


        {/* VIEW CALENDAR BY YEAR */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">
            View Calendar
          </h2>

          <label className="text-sm text-gray-300 mb-2 block">
            Select Year
          </label>

          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-full p-3 rounded-lg bg-slate-800 border border-white/10 text-white mb-4"
          >
            {[2024, 2025, 2026, 2027, 2028, 2029].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <button
            onClick={() =>
              router.push(`/subsystems/leaves/calendar/${year}`)
            }
            className="w-full py-3 bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            View Calendar
          </button>
        </div>
      </div>
    </div>
  );
}
