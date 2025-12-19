// components/leaves/forms/CalendarEditor.tsx
import React, { useState, useEffect } from "react";
import {
  isWeekend,
  isHoliday,
  isInBlockedPeriod,
  calculateWorkingDaysBetween,
  getDaysInMonth,
  getMonthName,
  getFirstDayOfMonth,
  hasOverlap,
  formatDate,
} from "@/utils/dateUtils";
import type { Holiday, BlockedPeriod, LeaveRequest } from "@/enums/calendar.types";

interface Props {
  year: number;
  month: number;
  holidays: Holiday[];
  blockedPeriods: BlockedPeriod[];
  currentBalance: number;
  existingLeaves: LeaveRequest[];
  onDateRangeSelect: (start: Date, end: Date, workingDays: number) => void;
  onClose?: () => void; // ✅ renamed
}


export default function CalendarEditor({
  year,
  month,
  holidays,
  blockedPeriods,
  currentBalance,
  existingLeaves,
  onDateRangeSelect,
  onClose,
}: Props) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [workingDays, setWorkingDays] = useState(0);

  const holidayDates = holidays.map(h => new Date(h.date));
  const blockedPeriodDates = blockedPeriods.map(bp => ({
    from: new Date(bp.from),
    to: new Date(bp.to),
  }));

  const daysInMonth = getDaysInMonth(month, year);
  const firstDayOfMonth = getFirstDayOfMonth(month, year);
  const paddingCells = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  useEffect(() => {
    if (startDate && endDate) {
      const days = calculateWorkingDaysBetween(startDate, endDate, holidayDates);
      setWorkingDays(days);
    } else {
      setWorkingDays(0);
    }
  }, [startDate, endDate, holidays]);

  const handleDayClick = (date: Date) => {
    setValidationErrors([]);

    if (isWeekend(date)) {
      setValidationErrors(["❌ Cannot select weekends"]);
      return;
    }

    if (isHoliday(date, holidayDates)) {
      setValidationErrors(["❌ Cannot select holidays"]);
      return;
    }

    if (isInBlockedPeriod(date, blockedPeriodDates)) {
      const blocked = blockedPeriods.find(bp => {
        const start = new Date(bp.from);
        const end = new Date(bp.to);
        return date >= start && date <= end;
      });
      setValidationErrors([`❌ Blocked: ${blocked?.reason || 'Period blocked'}`]);
      return;
    }

    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate(null);
      return;
    }

    if (date < startDate) {
      setEndDate(startDate);
      setStartDate(date);
    } else {
      setEndDate(date);
    }
  };

  useEffect(() => {
    if (!startDate || !endDate) return;

    const errors: string[] = [];

    if (workingDays > currentBalance) {
      errors.push(`❌ Insufficient balance (need ${workingDays}, have ${currentBalance})`);
    }

    if (hasOverlap(startDate, endDate, existingLeaves)) {
      errors.push("⚠️ Overlaps with existing leave");
    }

    setValidationErrors(errors);

    if (errors.length === 0) {
      onDateRangeSelect(startDate, endDate, workingDays);
    }
  }, [startDate, endDate, workingDays, currentBalance, existingLeaves]);

  const isDateInRange = (date: Date): boolean => {
    if (!startDate || !endDate) return false;
    return date >= startDate && date <= endDate;
  };

  const getDayClassName = (date: Date): string => {
    let classes = "p-3 text-center rounded transition-all min-h-[2.5rem] flex items-center justify-center";

    const isDisabled = isWeekend(date) || isHoliday(date, holidayDates) || isInBlockedPeriod(date, blockedPeriodDates);

    if (isDisabled) {
      classes += " bg-white/5 text-gray-600 cursor-not-allowed";
    } else {
      classes += " cursor-pointer hover:bg-white/10 text-white";
    }

    if (isDateInRange(date) && !isDisabled) {
      classes += " bg-blue-500/40 border border-blue-500";
    }

    if (startDate && date.getTime() === startDate.getTime()) {
      classes += " bg-cyan-500/60 font-bold ring-2 ring-cyan-400";
    }
    if (endDate && date.getTime() === endDate.getTime()) {
      classes += " bg-cyan-500/60 font-bold ring-2 ring-cyan-400";
    }

    return classes;
  };

  return (
    <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-2xl">
      <h3 className="text-lg font-semibold text-white mb-4">📅 Select Leave Dates</h3>

      <div className="mb-6">
        <div className="text-center text-white text-xl mb-4">
          {getMonthName(month)} {year}
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-semibold text-gray-400 p-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {paddingCells.map(i => (
            <div key={`padding-${i}`} className="p-3" />
          ))}

          {daysInMonth.map(date => (
            <div
              key={date.toString()}
              className={getDayClassName(date)}
              onClick={() => handleDayClick(date)}
            >
              <span>{date.getDate()}</span>
            </div>
          ))}
        </div>
      </div>

      {startDate && endDate && (
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg mb-4">
          <h4 className="text-white font-semibold mb-2">📊 Selection Summary</h4>
          <div className="text-sm text-gray-300 space-y-1">
            <p><strong>From:</strong> {formatDate(startDate)}</p>
            <p><strong>To:</strong> {formatDate(endDate)}</p>
            <p><strong>Working days:</strong> {workingDays}</p>
            <p><strong>Balance:</strong> {currentBalance}</p>
            <p className={workingDays > currentBalance ? "text-red-400" : "text-green-400"}>
              <strong>Remaining:</strong> {currentBalance - workingDays}
            </p>
          </div>
        </div>
      )}

      {validationErrors.length > 0 && (
        <div className="p-4 bg-red-500/20 border border-red-500/40 rounded-lg mb-4">
          {validationErrors.map((error, idx) => (
            <p key={idx} className="text-red-300 text-sm">{error}</p>
          ))}
        </div>
      )}

      <div className="mb-4 p-3 bg-white/5 rounded-lg text-sm text-gray-400">
        <p>• Click to select start, then end date</p>
        <p>• Weekends, holidays, blocked days excluded</p>
      </div>

      <div className="flex justify-end gap-3">
        {onClose && (
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-md bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10"
          >
            Cancel
          </button>
        )}

        <button
          onClick={() =>
            startDate &&
            endDate &&
            validationErrors.length === 0 &&
            onDateRangeSelect(startDate, endDate, workingDays)
          }
          disabled={!startDate || !endDate || validationErrors.length > 0}
          className="px-6 py-2 rounded-md bg-gradient-to-r from-blue-600 to-cyan-500 text-white disabled:opacity-50"
        >
          Confirm
        </button>
      </div>

    </div>
  );
}