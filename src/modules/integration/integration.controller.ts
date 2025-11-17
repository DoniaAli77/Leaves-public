// src/modules/integration/integration.controller.ts

import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { IntegrationService } from './integration.service';
import { GetEmployeeProfileResponse } from './interfaces/employee-profile.interface';
import { GetReportingLineResponse } from './interfaces/org-structure.interface';
import {
  LeaveBlockRequest,
  LeaveBlockResponse,
} from './interfaces/time-management.interface';
import {
  SyncLeaveToPayrollRequest,
  SyncLeaveToPayrollResponse,
} from './interfaces/payroll.interface';

@Controller('integration')
export class IntegrationController {
  constructor(private readonly integrationService: IntegrationService) {}

  @Get('status')
  getStatus() {
    return this.integrationService.getIntegrationStatus();
  }

  @Get('employee-profile/:employeeId')
  async getEmployeeProfile(
    @Param('employeeId') employeeId: string,
  ): Promise<GetEmployeeProfileResponse> {
    return this.integrationService.getEmployeeProfile({ employeeId });
  }

  @Get('reporting-line/:employeeId')
  async getReportingLine(
    @Param('employeeId') employeeId: string,
  ): Promise<GetReportingLineResponse> {
    return this.integrationService.getReportingLine({ employeeId });
  }

  @Post('time-management/block-attendance')
  async blockAttendance(
    @Body() request: LeaveBlockRequest,
  ): Promise<LeaveBlockResponse> {
    return this.integrationService.blockAttendance(request);
  }

  @Post('time-management/unblock-attendance')
  async unblockAttendance(@Body() body: { leaveRequestId: string }) {
    return this.integrationService.unblockAttendance(body.leaveRequestId);
  }

  @Post('payroll/sync-leave')
  async syncLeaveToPayroll(
    @Body() request: SyncLeaveToPayrollRequest,
  ): Promise<SyncLeaveToPayrollResponse> {
    return this.integrationService.syncLeaveToPayroll(request);
  }

  @Post('payroll/submit-settlement')
  async submitLeaveSettlement(@Body() settlementData: any) {
    return this.integrationService.submitLeaveSettlement(settlementData);
  }
}
