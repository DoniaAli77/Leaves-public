// enums/calendar.types.ts

export interface Holiday {
  _id?: string;
  name: string;
  date: string;
  type: string;
  isRecurring?: boolean;
}

export interface BlockedPeriod {
  from: string;
  to: string;
  reason: string;
}

export interface Calendar {
  _id: string;
  year: number;
  holidays: string[] | Holiday[];
  blockedPeriods: BlockedPeriod[];
  createdAt?: string;
  updatedAt?: string;
}

export interface LeaveRequest {
  _id: string;
  employeeId: string;
  leaveTypeId: string;
  dates: {
    from: string;
    to: string;
  };
  durationDays: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  justification?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCalendarDto {
  year: number;
  holidays?: Holiday[];
  blockedPeriods?: BlockedPeriod[];
  workingDays?: number[];
  isActive?: boolean;
}

export interface UpdateCalendarDto extends Partial<CreateCalendarDto> {}