// components/leaves/cards/CalendarCard.tsx
import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  isWeekend,
  isHoliday,
  isInBlockedPeriod,
  getDaysInMonth,
  getMonthName,
  getFirstDayOfMonth,
} from "@/utils/dateUtils";
import type { Holiday, BlockedPeriod, LeaveRequest } from "@/enums/calendar.types";

interface Props {
  year: number;
  initialMonth?: number;
  holidays: Holiday[];
  blockedPeriods: BlockedPeriod[];
  leaves?: LeaveRequest[];
  onMonthChange?: (month: number) => void;
  onDateClick?: (date: Date) => void;
  showNavigation?: boolean;
}

export default function CalendarCard({
  year,
  initialMonth = new Date().getMonth() + 1,
  holidays,
  blockedPeriods,
  leaves = [],
  onMonthChange,
  onDateClick,
  showNavigation = true,
}: Props) {
  const [currentMonth, setCurrentMonth] = useState(initialMonth);

  const holidayDates = holidays.map(h => new Date(h.date));
  const blockedPeriodDates = blockedPeriods.map(bp => ({
    from: new Date(bp.from),
    to: new Date(bp.to),
  }));

  const daysInMonth = getDaysInMonth(currentMonth, year);
  const firstDayOfMonth = getFirstDayOfMonth(currentMonth, year);
  const paddingCells = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const handlePrevMonth = () => {
    const newMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    setCurrentMonth(newMonth);
    onMonthChange?.(newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = currentMonth === 12 ? 1 : currentMonth + 1;
    setCurrentMonth(newMonth);
    onMonthChange?.(newMonth);
  };

  const getDayClassName = (date: Date): string => {
    let classes = "p-2 text-center rounded transition-all min-h-[2.5rem] flex items-center justify-center";

    if (onDateClick) {
      classes += " cursor-pointer hover:bg-white/10";
    }

    if (isWeekend(date)) {
      classes += " bg-white/5 text-gray-400";
    } else {
      classes += " text-white";
    }

    if (isHoliday(date, holidayDates)) {
      classes += " bg-red-500/20 text-red-300 font-bold border border-red-500/40";
    }

    if (isInBlockedPeriod(date, blockedPeriodDates)) {
      classes += " bg-yellow-500/20 border-2 border-yellow-500";
    }

    leaves.forEach(leave => {
      const leaveStart = new Date(leave.dates.from);
      const leaveEnd = new Date(leave.dates.to);
      if (date >= leaveStart && date <= leaveEnd) {
        if (leave.status === 'approved') {
          classes += " bg-green-500/30 border border-green-500";
        } else if (leave.status === 'pending') {
          classes += " bg-blue-500/30 border border-blue-500";
        }
      }
    });

    return classes;
  };

  const getHolidayName = (date: Date): string | null => {
    const holiday = holidays.find(h => {
      const holidayDate = new Date(h.date);
      return (
        holidayDate.getFullYear() === date.getFullYear() &&
        holidayDate.getMonth() === date.getMonth() &&
        holidayDate.getDate() === date.getDate()
      );
    });
    return holiday ? holiday.name : null;
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-white">
          {getMonthName(currentMonth)} {year}
        </h3>
        {showNavigation && (
          <div className="flex gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-md bg-white/5 hover:bg-white/10 transition"
            >
              <ChevronLeft className="w-5 h-5 text-cyan-300" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-md bg-white/5 hover:bg-white/10 transition"
            >
              <ChevronRight className="w-5 h-5 text-cyan-300" />
            </button>
          </div>
        )}
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
          <div key={`padding-${i}`} className="p-2" />
        ))}

        {daysInMonth.map(date => {
          const holidayName = getHolidayName(date);
          return (
            <div
              key={date.toString()}
              className={getDayClassName(date)}
              onClick={() => onDateClick?.(date)}
              title={holidayName || undefined}
            >
              <span>{date.getDate()}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-sm text-gray-300">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500/20 border border-red-500/40" />
          <span>Holiday</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-500/20 border-2 border-yellow-500" />
          <span>Blocked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500/30 border border-green-500" />
          <span>Approved</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-500/30 border border-blue-500" />
          <span>Pending</span>
        </div>
      </div>
    </div>
  );
}