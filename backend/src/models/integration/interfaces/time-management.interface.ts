// src/modules/integration/interfaces/time-management.interface.ts

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  ON_LEAVE = 'ON_LEAVE',
}

export interface LeaveBlockRequest {
  employeeId: string;
  leaveRequestId: string;
  startDate: Date;
  endDate: Date;
  leaveType: string;
  status: 'APPROVED' | 'CANCELLED';
}

export interface LeaveBlockResponse {
  success: boolean;
  data: {
    blockId: string;
    employeeId: string;
    startDate: Date;
    endDate: Date;
    blockedDays: number;
  };
}

export interface UnblockAttendanceRequest {
  leaveRequestId: string;
  employeeId: string;
}

export interface UnblockAttendanceResponse {
  success: boolean;
  message: string;
}

export interface GetAttendanceDataRequest {
  employeeId: string;
  startDate: Date;
  endDate: Date;
}

export interface GetAttendanceDataResponse {
  success: boolean;
  data: {
    employeeId: string;
    period: {
      startDate: Date;
      endDate: Date;
    };
    summary: {
      totalDays: number;
      presentDays: number;
      absentDays: number;
      lateDays: number;
      onLeaveDays: number;
    };
    records: {
      date: Date;
      status: AttendanceStatus;
      checkIn?: Date;
      checkOut?: Date;
      workingHours?: number;
    }[];
  };
}
