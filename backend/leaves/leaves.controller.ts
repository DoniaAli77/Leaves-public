import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UsePipes,
  ParseIntPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import type { Request } from 'express';


import { LeavesService } from './leaves.service';

// DTOs
import { BulkLeaveRequestDto } from './dto/bulk-leave-request.dto';
import { FilterLeaveRequestsDto } from './dto/filter-leave-requests.dto';

import { CreateLeaveTypeDto } from './dto/create-leave-type.dto';
import { UpdateLeaveTypeDto } from './dto/update-leave-type.dto';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { UpdatePolicyDto } from './dto/update-policy.dto';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { UpdateLeaveRequestDto } from './dto/update-leave-request.dto';
import { ApproveRequestDto } from './dto/approve-request.dto';
import { CreateLeaveEntitlementDto } from './dto/create-leave-entitlement.dto';
import { UpdateLeaveEntitlementDto } from './dto/update-leave-entitlement.dto';
import { CreateAdjustmentDto } from './dto/create-adjustment.dto';
import { ApproveAdjustmentDto } from './dto/approve-adjustment.dto';
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { UpdateCalendarDto } from './dto/update-calendar.dto';
import { CreateBlockedPeriodDto } from './dto/create-blocked-period.dto';
import { CreateLeaveCategoryDto } from './dto/create-leave-category.dto';

// Auth & Roles
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ADMIN_ROLES } from '../common/constants/role-groups';
import { SystemRole } from '../employee-profile/enums/employee-profile.enums';

@Controller()
//@UseGuards(JwtAuthGuard, RolesGuard) // ✅ applies JWT + role checking to ALL endpoints
export class LeavesController {
  constructor(private readonly service: LeavesService) {}

  // ===================================================
  // LEAVE TYPE
  // ===================================================
  @Post('leave-type')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  createLeaveType(@Body() dto: CreateLeaveTypeDto) {
    return this.service.leaveType.create(dto);
  }

  @Get('leave-type')
  findAllLeaveTypes() {
    return this.service.leaveType.findAll();
  }

  @Get('leave-type/:id')
  findLeaveType(@Param('id') id: string) {
    return this.service.leaveType.findOne(id);
  }

  @Get('leave-type/code/:code')
  findLeaveTypeByCode(@Param('code') code: string) {
    return this.service.leaveType.findByCode(code);
  }

  @Patch('leave-type/:id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  updateLeaveType(@Param('id') id: string, @Body() dto: UpdateLeaveTypeDto) {
    return this.service.leaveType.update(id, dto);
  }

  @Delete('leave-type/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeLeaveType(@Param('id') id: string) {
    return this.service.leaveType.remove(id);
  }

  // ===================================================
  // LEAVE POLICY
  // ===================================================
  @Post('leave-policy')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ADMIN_ROLES)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  createPolicy(@Body() dto: CreatePolicyDto) {
    return this.service.leavePolicy.create(dto);
  }

  @Get('leave-policy')
  findAllPolicies() {
    return this.service.leavePolicy.findAll();
  }

  @Get('leave-policy/:id')
  findPolicy(@Param('id') id: string) {
    return this.service.leavePolicy.findOne(id);
  }

  @Patch('leave-policy/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ADMIN_ROLES)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  updatePolicy(@Param('id') id: string, @Body() dto: UpdatePolicyDto) {
    return this.service.leavePolicy.update(id, dto);
  }

  @Delete('leave-policy/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ADMIN_ROLES)
  @HttpCode(HttpStatus.NO_CONTENT)
  removePolicy(@Param('id') id: string) {
    return this.service.leavePolicy.remove(id);
  }

  // ===================================================
  // ✅ REQUIREMENT 1: POLICY EXPIRY CHECK (HR Admin)
  // ===================================================
  @Patch('leave-policy/check-expiry')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ADMIN_ROLES)
  checkPolicyExpiry() {
    return this.service.leavePolicy.checkExpiryRules();
  }

  // ===================================================
  // LEAVE CATEGORY
  // ===================================================
  @Post('leave-category')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  createCategory(@Body() dto: CreateLeaveCategoryDto) {
    return this.service.leaveCategory.create(dto);
  }

  @Get('leave-category')
  findAllCategories() {
    return this.service.leaveCategory.findAll();
  }

  @Patch('leave-category/:id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  updateCategory(@Param('id') id: string, @Body() dto: CreateLeaveCategoryDto) {
    return this.service.leaveCategory.update(id, dto);
  }

  @Delete('leave-category/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeCategory(@Param('id') id: string) {
    return this.service.leaveCategory.remove(id);
  }

  // ===================================================
  // LEAVE REQUEST
  // ===================================================
  @Post('leave-request')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  createRequest(@Body() dto: CreateLeaveRequestDto) {
    return this.service.leaveRequest.create(dto);
  }

  @Get('leave-request')
  findAllRequests() {
    return this.service.leaveRequest.findAll();
  }

  @Get('leave-request/:id')
  findRequest(@Param('id') id: string) {
    return this.service.leaveRequest.findOne(id);
  }

  @Put('leave-request/:id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  updateRequest(@Param('id') id: string, @Body() dto: UpdateLeaveRequestDto) {
    return this.service.leaveRequest.update(id, dto);
  }

  @Put('leave-request/:id/approve/manager')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.DEPARTMENT_HEAD) // direct manager
  @UsePipes(new ValidationPipe({ whitelist: true }))
  approveReq(@Param('id') id: string, @Body() dto: ApproveRequestDto) {
    return this.service.leaveRequest.managerApprove(id, dto.approverId);
  }

  @Put('leave-request/:id/reject/manager')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.DEPARTMENT_HEAD) // direct manager
  @UsePipes(new ValidationPipe({ whitelist: true }))
  rejectReq(@Param('id') id: string, @Body() dto: ApproveRequestDto) {
    return this.service.leaveRequest.managerReject(id, dto.approverId, dto.comment);
  }

  // ===================================================
  // ✅ REQUIREMENT 2: BULK REQUEST PROCESSING (HR Manager)
  // ===================================================
  @Put('leave-request/bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.HR_MANAGER)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  bulkProcess(@Body() dto: BulkLeaveRequestDto) {
    return this.service.leaveRequest.bulkProcess(dto);
  }

  // ===================================================
  // ✅ REQUIREMENT 3: FILTER REQUEST HISTORY (All Roles)
  // ===================================================
  @Get('leave-request/history')
  filterHistory(@Query() params: FilterLeaveRequestsDto) {
    return this.service.leaveRequest.filter(params);
  }

  // ===================================================
  // ✅ REQUIREMENT 4: VIEW TEAM BALANCES + UPCOMING LEAVES (Direct Manager)
  // ===================================================
  /**now here we will use the imports import { Req } from '@nestjs/common';
     import { Request } from 'express'; */

  @Get('manager/team-leaves')
  @UseGuards(JwtAuthGuard, RolesGuard)
@Roles(SystemRole.DEPARTMENT_HEAD)
getMyTeamLeaves(@Req() req: Request) {
  const managerEmployeeId = (req as any).user.id;
  return this.service.getTeamLeaves(managerEmployeeId);
}


  // ===================================================
  // LEAVE ENTITLEMENT
  // ===================================================
  @Post('leave-entitlement')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  createEntitlement(@Body() dto: CreateLeaveEntitlementDto) {
    return this.service.leaveEntitlement.create(dto);
  }

  @Get('leave-entitlement/:employeeId')
  getEmployeeEnt(@Param('employeeId') employeeId: string) {
    return this.service.leaveEntitlement.findByEmployee(employeeId);
  }

  @Put('leave-entitlement/:employeeId')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  updateEnt(@Param('employeeId') employeeId: string, @Body() dto: UpdateLeaveEntitlementDto) {
    return this.service.leaveEntitlement.update(employeeId, dto);
  }

  @Delete('leave-entitlement/:employeeId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeEnt(@Param('employeeId') employeeId: string) {
    return this.service.leaveEntitlement.removeByEmployee(employeeId);
  }

  // ===================================================
  // LEAVE ADJUSTMENT
  // ===================================================
  @Post('leave-adjustment')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  createAdjustment(@Body() dto: CreateAdjustmentDto) {
    return this.service.leaveAdjustment.create(dto);
  }

  @Put('leave-adjustment/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.HR_MANAGER)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  approveAdjustment(@Param('id') id: string, @Body() dto: ApproveAdjustmentDto) {
    return this.service.leaveAdjustment.approve(id, dto);
  }

  // ===================================================
  // CALENDAR
  // ===================================================
  @Post('calendar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ADMIN_ROLES)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  createCalendar(@Body() dto: CreateCalendarDto) {
    return this.service.calendar.create(dto);
  }

  @Get('calendar/:year')
  findCalendar(@Param('year', ParseIntPipe) year: number) {
    return this.service.calendar.findByYear(year);
  }

  @Patch('calendar/:year')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ADMIN_ROLES)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  updateCalendar(
    @Param('year', ParseIntPipe) year: number,
    @Body() dto: UpdateCalendarDto,
  ) {
    return this.service.calendar.update(year, dto);
  }

  @Post('calendar/:year/blocked-period')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ADMIN_ROLES)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  addBlocked(
    @Param('year', ParseIntPipe) year: number,
    @Body() dto: CreateBlockedPeriodDto,
  ) {
    return this.service.calendar.addBlockedPeriod(year, dto);
  }

  @Delete('calendar/:year/blocked-period/:index')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ADMIN_ROLES)
  @HttpCode(HttpStatus.NO_CONTENT)
  removeBlockedPeriod(
    @Param('year', ParseIntPipe) year: number,
    @Param('index', ParseIntPipe) index: number,
  ) {
    return this.service.calendar.removeBlockedPeriod(year, index);
  }
}
