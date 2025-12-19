import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import axios from "@/utils/axiosInstance";
import CalendarCard from "@/components/leaves/cards/CalendarCard";
import { useAuth } from "@/hooks/useAuth";
import { isAdmin } from "@/utils/roles";

export default function CalendarDetailPage() {
  const router = useRouter();
  const { id } = router.query; // year

  const [calendar, setCalendar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const admin = isAdmin(user?.roles);

  // NEW — blocked period form state
  const [blockedForm, setBlockedForm] = useState({
    from: "",
    to: "",
    reason: "",
  });

  // =============================
  // LOAD CALENDAR (GET)
  // =============================
  const loadCalendar = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await axios.get(`/calendar/${id}`);
      setCalendar(res.data);
    } catch {
      alert("Calendar not found");
      router.push("/subsystems/leaves/calendar");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalendar();
  }, [id]);

  // =============================
  // ADD BLOCKED PERIOD (POST)
  // =============================
  const handleAddBlockedPeriod = async () => {
    if (!blockedForm.from || !blockedForm.to || !blockedForm.reason) {
      alert("Fill all blocked period fields");
      return;
    }

    await axios.post(`/calendar/${id}/blocked-period`, {
  startDate: blockedForm.from,
  endDate: blockedForm.to,
  reason: blockedForm.reason,
});


    setBlockedForm({ from: "", to: "", reason: "" });
    loadCalendar();
  };

  // =============================
  // REMOVE BLOCKED PERIOD (DELETE)
  // =============================
  const handleRemoveBlocked = async (index: number) => {
    if (!confirm("Remove blocked period?")) return;

    await axios.delete(`/calendar/${id}/blocked-period/${index}`);
    loadCalendar();
  };

  // =============================
  // UPDATE CALENDAR (PATCH)
  // =============================
  const handleUpdateCalendar = async () => {
    await axios.patch(`/calendar/${id}`, {
      holidays: calendar.holidays,
      blockedPeriods: calendar.blockedPeriods,
    });

    alert("Calendar updated");
  };

  // =============================
  // RENDER
  // =============================
  if (loading) {
    return <p className="text-white p-10">Loading…</p>;
  }

  if (!calendar) {
    return <p className="text-white p-10">Calendar not found</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-10 text-white">

      {/* BACK */}
      <button
        onClick={() => router.push("/subsystems/leaves/calendar")}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to calendars
      </button>

      {/* TITLE */}
      <h1 className="text-4xl font-bold mb-6">
        Calendar {calendar.year}
      </h1>

      {/* CALENDAR CARD */}
      <CalendarCard
        year={calendar.year}
        holidays={calendar.holidays}
        blockedPeriods={calendar.blockedPeriods}
      />

      {/* UPDATE CALENDAR */}
      {admin && (
        <button
          onClick={handleUpdateCalendar}
          className="mt-6 flex items-center gap-2 px-5 py-2 bg-green-600 rounded"
        >
          <Save size={16} />
          Save Calendar
        </button>
      )}


      {/* ========================= */}
      {/* BLOCKED PERIODS LIST */}
      {/* ========================= */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Blocked Periods</h2>

        {calendar.blockedPeriods.length === 0 ? (
          <p className="text-gray-400">No blocked periods</p>
        ) : (
          calendar.blockedPeriods.map((bp: any, index: number) => (
            <div
              key={index}
              className="flex justify-between bg-white/5 p-4 rounded mb-2"
            >
              <div>
                <p className="text-yellow-300">{bp.reason}</p>
                <p className="text-sm text-gray-400">
                  {bp.from} → {bp.to}
                </p>
              </div>

              {admin && (
                <button
                  onClick={() => handleRemoveBlocked(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 />
                </button>
              )}

            </div>
          ))
        )}
      </div>

      {/* ========================= */}
      {/* ADD BLOCKED PERIOD */}
      {/* ========================= */}
      {admin && (
      <div className="mt-10 bg-white/5 p-6 rounded-xl max-w-xl">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Plus size={18} /> Add Blocked Period
        </h3>

        <input
          type="date"
          value={blockedForm.from}
          onChange={(e) =>
            setBlockedForm({ ...blockedForm, from: e.target.value })
          }
          className="w-full mb-3 p-2 rounded bg-slate-800"
        />

        <input
          type="date"
          value={blockedForm.to}
          onChange={(e) =>
            setBlockedForm({ ...blockedForm, to: e.target.value })
          }
          className="w-full mb-3 p-2 rounded bg-slate-800"
        />

        <input
          placeholder="Reason"
          value={blockedForm.reason}
          onChange={(e) =>
            setBlockedForm({ ...blockedForm, reason: e.target.value })
          }
          className="w-full mb-4 p-2 rounded bg-slate-800"
        />
        <button
          onClick={handleAddBlockedPeriod}
          className="w-full py-2 bg-blue-600 rounded"
        >
          Add Blocked Period
        </button>
      </div>
    )}
    </div>
  );
}
