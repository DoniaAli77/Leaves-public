// src/modules/integration/integration.service.ts

import { Injectable } from '@nestjs/common';
import {
  EmployeeProfileData,
  GetEmployeeProfileRequest,
  GetEmployeeProfileResponse,
  ContractType,
  EmploymentStatus,
} from './interfaces/employee-profile.interface';
import {
  ReportingLineData,
  GetReportingLineRequest,
  GetReportingLineResponse,
} from './interfaces/org-structure.interface';
import {
  LeaveBlockRequest,
  LeaveBlockResponse,
} from './interfaces/time-management.interface';
import {
  SyncLeaveToPayrollRequest,
  SyncLeaveToPayrollResponse,
} from './interfaces/payroll.interface';

@Injectable()
export class IntegrationService {
  async getEmployeeProfile(
    request: GetEmployeeProfileRequest,
  ): Promise<GetEmployeeProfileResponse> {
    const mockEmployee: EmployeeProfileData = {
      employeeId: request.employeeId,
      personalInfo: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@company.com',
        phone: '+201234567890',
        hireDate: new Date('2020-01-15'),
        workStartDate: new Date('2020-02-01'),
        gender: 'MALE',
      },
      employment: {
        contractType: ContractType.PERMANENT,
        grade: 'Senior',
        departmentId: 'dept_001',
        positionId: 'pos_001',
        managerId: 'emp_manager_001',
        status: EmploymentStatus.ACTIVE,
      },
      compensation: {
        baseSalary: 15000,
        currency: 'EGP',
      },
    };

    return {
      success: true,
      data: mockEmployee,
    };
  }

  async getReportingLine(
    request: GetReportingLineRequest,
  ): Promise<GetReportingLineResponse> {
    const mockReportingLine: ReportingLineData = {
      employeeId: request.employeeId,
      positionId: 'pos_001',
      departmentId: 'dept_001',
      directManagerId: 'emp_manager_001',
      departmentHeadId: 'emp_head_001',
      approvalChain: [
        {
          level: 1,
          roleType: 'DIRECT_MANAGER',
          userId: 'emp_manager_001',
          userName: 'Manager One',
        },
        {
          level: 2,
          roleType: 'HR_MANAGER',
          userId: 'emp_hr_001',
          userName: 'HR Manager',
        },
      ],
    };

    return {
      success: true,
      data: mockReportingLine,
    };
  }

  async blockAttendance(
    request: LeaveBlockRequest,
  ): Promise<LeaveBlockResponse> {
    const diffTime =
      request.endDate.getTime() - request.startDate.getTime();
    const blockedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    return {
      success: true,
      data: {
        blockId: `block_${Date.now()}`,
        employeeId: request.employeeId,
        startDate: request.startDate,
        endDate: request.endDate,
        blockedDays,
      },
    };
  }

  async unblockAttendance(leaveRequestId: string): Promise<any> {
    return {
      success: true,
      message: `Attendance unblocked for leave request ${leaveRequestId}`,
    };
  }

  async syncLeaveToPayroll(
    request: SyncLeaveToPayrollRequest,
  ): Promise<SyncLeaveToPayrollResponse> {
    return {
      success: true,
      data: {
        employeeId: request.employeeId,
        payrollPeriod: request.payrollPeriod,
        syncedAt: new Date(),
        transactionCount: request.leaveData.leaveTransactions.length,
      },
    };
  }

  async submitLeaveSettlement(settlementData: any): Promise<any> {
    return {
      success: true,
      data: {
        settlementId: `settlement_${Date.now()}`,
        employeeId: settlementData.employeeId,
        totalAmount: settlementData.totalEncashment,
        status: 'PENDING',
        submittedAt: new Date(),
      },
    };
  }

  async getIntegrationStatus(): Promise<any> {
    return {
      success: true,
      data: {
        employeeProfileIntegration: 'READY',
        orgStructureIntegration: 'READY',
        timeManagementIntegration: 'READY',
        payrollIntegration: 'READY',
        lastHealthCheck: new Date(),
      },
    };
  }
}
