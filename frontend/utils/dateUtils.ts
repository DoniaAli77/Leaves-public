// utils/dateUtils.ts

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function isHoliday(date: Date, holidays: Date[]): boolean {
  return holidays.some(holiday => isSameDay(holiday, date));
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function isInBlockedPeriod(
  date: Date,
  blockedPeriods: { from: Date; to: Date }[]
): boolean {
  return blockedPeriods.some(period => {
    const start = new Date(period.from);
    const end = new Date(period.to);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return date >= start && date <= end;
  });
}

export function getDaysInMonth(month: number, year: number): Date[] {
  const days: Date[] = [];
  const lastDay = new Date(year, month, 0).getDate();
  
  for (let i = 1; i <= lastDay; i++) {
    days.push(new Date(year, month - 1, i));
  }
  
  return days;
}

export function calculateWorkingDaysBetween(
  start: Date,
  end: Date,
  holidays: Date[]
): number {
  let count = 0;
  const current = new Date(start);
  current.setHours(0, 0, 0, 0);
  const endDate = new Date(end);
  endDate.setHours(0, 0, 0, 0);
  
  while (current <= endDate) {
    if (!isWeekend(current) && !isHoliday(current, holidays)) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

export function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1] || 'Invalid';
}

export function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function hasOverlap(
  start: Date,
  end: Date,
  existingLeaves: { dates: { from: string; to: string }; status: string }[]
): boolean {
  const activeLeaves = existingLeaves.filter(
    leave => leave.status === 'approved' || leave.status === 'pending'
  );

  return activeLeaves.some(leave => {
    const leaveStart = new Date(leave.dates.from);
    const leaveEnd = new Date(leave.dates.to);
    return start <= leaveEnd && end >= leaveStart;
  });
}

export function getFirstDayOfMonth(month: number, year: number): number {
  return new Date(year, month - 1, 1).getDay();
}