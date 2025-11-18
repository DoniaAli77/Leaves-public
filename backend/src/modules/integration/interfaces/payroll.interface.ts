//src/modules/integration/interfaces/payroll.interface.ts


export enum PayCode {
  PAY_ANNUAL = 'PAY_ANNUAL',
  PAY_SICK = 'PAY_SICK',
  PAY_UNPAID = 'PAY_UNPAID',
  PAY_MARRIAGE = 'PAY_MARRIAGE',
  PAY_MATERNITY = 'PAY_MATERNITY',
  PAY_MISSION = 'PAY_MISSION',
}

export interface LeavePayrollTransaction {
  leaveRequestId: string;
  leaveTypeCode: string;
  payCode: PayCode;
  days: number;
  deductionAmount?: number;
  compensationAmount?: number;
  effectiveDate: Date;
}

export interface LeavePayrollData {
  employeeId: string;
  payrollPeriod: string;
  leaveTransactions: LeavePayrollTransaction[];
  encashments?: {
    leaveType: string;
    days: number;
    amount: number;
  };
  totalDeductions: number;
  totalCompensations: number;
}

export interface SyncLeaveToPayrollRequest {
  employeeId: string;
  payrollPeriod: string;
  leaveData: LeavePayrollData;
}

export interface SyncLeaveToPayrollResponse {
  success: boolean;
  data: {
    employeeId: string;
    payrollPeriod: string;
    syncedAt: Date;
    transactionCount: number;
  };
}

export interface LeaveSettlementData {
  employeeId: string;
  separationDate: Date;
  separationType: 'RESIGNATION' | 'TERMINATION' | 'CONTRACT_END';
  balances: {
    leaveType: string;
    remainingDays: number;
    encashable: boolean;
    encashedDays: number;
    encashmentAmount: number;
    dailyRate: number;
  }[];
  totalEncashment: number;
  deductions: number;
  netSettlement: number;
}

export interface SubmitLeaveSettlementRequest {
  settlementData: LeaveSettlementData;
}

export interface SubmitLeaveSettlementResponse {
  success: boolean;
  data: {
    settlementId: string;
    employeeId: string;
    totalAmount: number;
    status: 'PENDING' | 'APPROVED' | 'PAID';
    submittedAt: Date;
  };
}

export interface GetPayrollPeriodRequest {
  year: number;
  month: number;
}

export interface GetPayrollPeriodResponse {
  success: boolean;
  data: {
    period: string;
    startDate: Date;
    endDate: Date;
    status: 'OPEN' | 'CLOSED' | 'PROCESSING';
    cutoffDate: Date;
  };
}

export interface EmployeeSalaryData {
  employeeId: string;
  baseSalary: number;
  dailyRate: number;
  currency: string;
}

export interface GetEmployeeSalaryRequest {
  employeeId: string;
}

export interface GetEmployeeSalaryResponse {
  success: boolean;
  data: EmployeeSalaryData;
}