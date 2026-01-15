import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EmployeeProfileService } from '../employee-profile/employee-profile.service';

// models (singular)
import { LeaveType, LeaveTypeDocument } from './models/leave-type.schema';
import { LeaveCategory } from './models/leave-category.schema';
import { LeavePolicy, LeavePolicyDocument } from './models/leave-policy.schema';
import { LeaveRequest, LeaveRequestDocument } from './models/leave-request.schema';
import { Attachment } from './models/attachment.schema';
import {
  LeaveEntitlement,
  LeaveEntitlementDocument,
} from './models/leave-entitlement.schema';
import {
  LeaveAdjustment,
  LeaveAdjustmentDocument,
} from './models/leave-adjustment.schema';
import { Calendar, CalendarDocument } from './models/calendar.schema';
import { EmployeeProfile } from '../employee-profile/models/employee-profile.schema';

// DTOs
import { CreateLeaveTypeDto } from './dto/create-leave-type.dto';
import { UpdateLeaveTypeDto } from './dto/update-leave-type.dto';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { UpdatePolicyDto } from './dto/update-policy.dto';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { UpdateLeaveRequestDto } from './dto/update-leave-request.dto';
import { CreateLeaveEntitlementDto } from './dto/create-leave-entitlement.dto';
import { UpdateLeaveEntitlementDto } from './dto/update-leave-entitlement.dto';
import { CreateAdjustmentDto } from './dto/create-adjustment.dto';
import { ApproveAdjustmentDto } from './dto/approve-adjustment.dto';
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { UpdateCalendarDto } from './dto/update-calendar.dto';
import { CreateBlockedPeriodDto } from './dto/create-blocked-period.dto';
import { FilterLeaveRequestsDto } from './dto/filter-leave-requests.dto';
import { BulkLeaveRequestDto } from './dto/bulk-leave-request.dto';

// enums
import { LeaveStatus } from './enums/leave-status.enum';
import { AdjustmentType } from './enums/adjustment-type.enum';

/**
 * Returned structure for Direct Manager team view
 */
export interface TeamLeaveSummary {
  employee: EmployeeProfile;
  entitlements: LeaveEntitlementDocument[];
  upcomingRequests: LeaveRequestDocument[];
}

@Injectable()
export class LeavesService {
  constructor(
    @InjectModel(LeaveType.name)
    private leaveTypeModel: Model<LeaveTypeDocument>,

    @InjectModel(LeaveCategory.name)
    private leaveCategoryModel: Model<LeaveCategory>,

    @InjectModel(LeavePolicy.name)
    private leavePolicyModel: Model<LeavePolicyDocument>,

    @InjectModel(LeaveRequest.name)
    private requestModel: Model<LeaveRequestDocument>,

    @InjectModel(Attachment.name)
    private attachmentModel: Model<Attachment>,

    @InjectModel(LeaveEntitlement.name)
    private entitlementModel: Model<LeaveEntitlementDocument>,

    @InjectModel(LeaveAdjustment.name)
    private adjustmentModel: Model<LeaveAdjustmentDocument>,

    @InjectModel(Calendar.name)
    private calendarModel: Model<CalendarDocument>,

    private readonly employeeProfileService: EmployeeProfileService,
  ) {}

  // ============================================================
  // PRIVATE HELPERS (Prevent Negative Balance)
  // ============================================================

  private recomputeRemaining(ent: LeaveEntitlementDocument) {
    ent.remaining =
      ent.yearlyEntitlement + ent.carryForward - ent.taken - ent.pending;
  }

  private async getEntitlementOrThrow(
    employeeId: Types.ObjectId,
    leaveTypeId: Types.ObjectId,
  ) {
    const ent = await this.entitlementModel.findOne({
      employeeId,
      leaveTypeId,
    });
    if (!ent) throw new NotFoundException('Leave entitlement not found');
    return ent;
  }

  /**
   * Reserve leave days for a PENDING request:
   * pending += days; remaining recalculated; remaining must not be negative.
   */
  private async reservePending(
    employeeId: Types.ObjectId,
    leaveTypeId: Types.ObjectId,
    days: number,
  ) {
    const ent = await this.getEntitlementOrThrow(employeeId, leaveTypeId);

    // Ensure enough remaining BEFORE reserving
    if (ent.remaining < days) {
      throw new BadRequestException('Insufficient leave balance');
    }

    ent.pending += days;
    this.recomputeRemaining(ent);

    if (ent.remaining < 0) {
      throw new BadRequestException('Insufficient leave balance');
    }

    await ent.save();
  }

  /**
   * Release pending leave days when request is REJECTED or CANCELLED (while pending):
   * pending -= days; remaining recalculated; pending must not go negative.
   */
  private async releasePending(
    employeeId: Types.ObjectId,
    leaveTypeId: Types.ObjectId,
    days: number,
  ) {
    const ent = await this.getEntitlementOrThrow(employeeId, leaveTypeId);

    if (ent.pending < days) {
      // This indicates data inconsistency; better to fail loudly
      throw new BadRequestException('Pending balance is inconsistent');
    }

    ent.pending -= days;
    this.recomputeRemaining(ent);

    if (ent.remaining < 0) {
      throw new BadRequestException('Insufficient leave balance');
    }

    await ent.save();
  }

  /**
   * Consume pending into taken when request is APPROVED:
   * pending -= days; taken += days; remaining recalculated; must not be negative.
   */
  private async consumePendingToTaken(
    employeeId: Types.ObjectId,
    leaveTypeId: Types.ObjectId,
    days: number,
  ) {
    const ent = await this.getEntitlementOrThrow(employeeId, leaveTypeId);

    if (ent.pending < days) {
      throw new BadRequestException('Insufficient pending leave balance');
    }

    ent.pending -= days;
    ent.taken += days;
    this.recomputeRemaining(ent);

    if (ent.remaining < 0) {
      throw new BadRequestException('Insufficient leave balance after approval');
    }

    await ent.save();
  }

  /**
   * If you allow cancelling an already APPROVED request, you must revert taken.
   */
  private async revertTaken(
    employeeId: Types.ObjectId,
    leaveTypeId: Types.ObjectId,
    days: number,
  ) {
    const ent = await this.getEntitlementOrThrow(employeeId, leaveTypeId);

    if (ent.taken < days) {
      throw new BadRequestException('Taken balance is inconsistent');
    }

    ent.taken -= days;
    this.recomputeRemaining(ent);

    if (ent.remaining < 0) {
      throw new BadRequestException('Insufficient leave balance');
    }

    await ent.save();
  }

  // ============================================================
  // REQUIREMENT 4: DIRECT MANAGER TEAM VIEW
  // ============================================================

  /**
   * View Team Members’ Leave Balances and Upcoming Leaves
   * Role: Direct Manager (Department Head)
   */
  async getTeamLeaves(managerId: string): Promise<TeamLeaveSummary[]> {
    const team = await this.employeeProfileService.getTeamSummaryForManager(
      managerId,
    );

    const summaries: TeamLeaveSummary[] = [];

    for (const member of team) {
      const entitlements = await this.entitlementModel
        .find({ employeeId: member._id })
        .populate('leaveTypeId')
        .exec();

      const upcomingRequests = await this.requestModel
        .find({
          employeeId: member._id,
          status: LeaveStatus.APPROVED,
          'dates.to': { $gte: new Date() },
        })
        .sort({ 'dates.from': 1 })
        .exec();

      summaries.push({
        employee: member,
        entitlements,
        upcomingRequests,
      });
    }

    return summaries;
  }

  // ============================================================
  // LEAVE CATEGORY
  // ============================================================
  leaveCategory = {
    create: async (dto) => {
      return new this.leaveCategoryModel(dto).save();
    },

    findAll: async () => this.leaveCategoryModel.find().exec(),

    update: async (id, dto) => {
      return this.leaveCategoryModel
        .findByIdAndUpdate(id, dto, { new: true })
        .exec();
    },

    remove: async (id) => {
      return this.leaveCategoryModel.findByIdAndDelete(id).exec();
    },
  };

  // ============================================================
  // LEAVE TYPE
  // ============================================================
  leaveType = {
    create: async (dto: CreateLeaveTypeDto) => {
      const exists = await this.leaveTypeModel.findOne({ code: dto.code }).exec();
      if (exists)
        throw new ConflictException(
          `Leave type with code '${dto.code}' already exists`,
        );
      return new this.leaveTypeModel(dto).save();
    },

    findAll: async () => this.leaveTypeModel.find().exec(),

    findActive: async () => this.leaveTypeModel.find({ isActive: true }).exec(),

    findOne: async (id: string) => {
      const doc = await this.leaveTypeModel.findById(id).exec();
      if (!doc) throw new NotFoundException(`Leave type with ID '${id}' not found`);
      return doc;
    },

    findByCode: async (code: string) => {
      const doc = await this.leaveTypeModel.findOne({ code }).exec();
      if (!doc)
        throw new NotFoundException(`Leave type with code '${code}' not found`);
      return doc;
    },

    update: async (id: string, dto: UpdateLeaveTypeDto) => {
      if ((dto as any).code) {
        const exists = await this.leaveTypeModel
          .findOne({ code: (dto as any).code, _id: { $ne: id } })
          .exec();
        if (exists)
          throw new ConflictException(
            `Leave type with code '${(dto as any).code}' already exists`,
          );
      }

      const updated = await this.leaveTypeModel
        .findByIdAndUpdate(id, dto, { new: true })
        .exec();
      if (!updated)
        throw new NotFoundException(`Leave type with ID '${id}' not found`);
      return updated;
    },

    remove: async (id: string) => {
      const result = await this.leaveTypeModel.findByIdAndDelete(id).exec();
      if (!result)
        throw new NotFoundException(`Leave type with ID '${id}' not found`);
    },
  };

  // ============================================================
  // REQUIREMENT 1: POLICY EXPIRY RULE CHECK (HR Admin)
  // ============================================================
  leavePolicy = {
    create: async (dto: CreatePolicyDto) => {
      const doc = new this.leavePolicyModel({
        ...dto,
        leaveTypeId: dto.leaveTypeId ? new Types.ObjectId(dto.leaveTypeId) : undefined,
      });
      return doc.save();
    },

    findAll: async () => this.leavePolicyModel.find().exec(),

    findActive: async () => {
      const now = new Date();
      return this.leavePolicyModel
        .find({
          isActive: true,
          $or: [
            { effectiveFrom: { $lte: now }, effectiveTo: { $gte: now } },
            { effectiveFrom: { $lte: now }, effectiveTo: null },
            { effectiveFrom: null, effectiveTo: null },
          ],
        })
        .exec();
    },

    findByType: async (policyType: string) =>
      this.leavePolicyModel.find({ policyType, isActive: true }).exec(),

    findOne: async (id: string) => {
      const doc = await this.leavePolicyModel.findById(id).exec();
      if (!doc) throw new NotFoundException(`Policy with ID '${id}' not found`);
      return doc;
    },

    update: async (id: string, dto: UpdatePolicyDto) => {
      const updated = await this.leavePolicyModel
        .findByIdAndUpdate(id, dto, { new: true })
        .exec();
      if (!updated) throw new NotFoundException(`Policy with ID '${id}' not found`);
      return updated;
    },

    remove: async (id: string) => {
      const deleted = await this.leavePolicyModel.findByIdAndDelete(id).exec();
      if (!deleted) throw new NotFoundException(`Policy with ID '${id}' not found`);
    },

    /**
     * Check expiry rules for policies and auto-deactivate expired policies.
     * A policy expires when (effectiveFrom OR createdAt) + expiryAfterMonths <= now.
     */
    checkExpiryRules: async () => {
      const now = new Date();
      const candidates = await this.leavePolicyModel
        .find({ expiryAfterMonths: { $ne: null } })
        .exec();

      let updated = 0;

      for (const policy of candidates) {
        const months = policy.expiryAfterMonths;

        if (!months || months <= 0) continue;

        const baseDate = policy.effectiveFrom ?? policy.createdAt;
        if (!baseDate) continue;

        const expiryDate = new Date(baseDate);
        expiryDate.setMonth(expiryDate.getMonth() + months);

        if (expiryDate <= now && policy.isActive) {
          policy.isActive = false;
          policy.effectiveTo = expiryDate;
          await policy.save();
          updated++;
        }
      }

      return { updated };
    },
  };

  // ============================================================
  // REQUIREMENTS 2, 3, 5: LEAVE REQUESTS
  //   - Bulk processing (HR Manager) -> bulkProcess
  //   - Filter request history (All roles) -> filter
  //   - Prevent negative leave balance -> create/update/approve/reject/cancel
  // ============================================================
  leaveRequest = {
    create: async (dto: CreateLeaveRequestDto) => {
      const from = new Date(dto.startDate);
      const to = new Date(dto.endDate);

      if (from > to) throw new BadRequestException('startDate must be <= endDate');

      const durationDays = (to.getTime() - from.getTime()) / 86400000 + 1;

      const employeeId = new Types.ObjectId(dto.employeeId);
      const leaveTypeId = new Types.ObjectId(dto.leaveTypeId);

      // Reserve days in pending (prevents negative balance)
      await this.reservePending(employeeId, leaveTypeId, durationDays);

      const doc = new this.requestModel({
        employeeId,
        leaveTypeId,
        dates: { from, to },
        durationDays,
        justification: dto.justification,
        attachmentId: dto.attachmentId ? new Types.ObjectId(dto.attachmentId) : undefined,
        approvalFlow: [],
        status: LeaveStatus.PENDING,
        irregularPatternFlag: false,
      });

      return doc.save();
    },

    findAll: async () => this.requestModel.find().lean(),

    findByEmployee: async (employeeId: string) =>
      this.requestModel
        .find({ employeeId: new Types.ObjectId(employeeId) })
        .sort({ createdAt: -1 })
        .lean(),

    findOne: async (id: string) => {
      const doc = await this.requestModel.findById(id).exec();
      if (!doc) throw new NotFoundException('Leave request not found');
      return doc;
    },

    /**
     * If you update dates while the request is pending,
     * adjust pending reservation correctly.
     */
    update: async (id: string, dto: UpdateLeaveRequestDto) => {
      const doc = await this.requestModel.findById(id).exec();
      if (!doc) throw new NotFoundException('Leave request not found');

      if (doc.status !== LeaveStatus.PENDING) {
        throw new BadRequestException('Only PENDING requests can be updated');
      }

      const oldFrom = doc.dates.from;
      const oldTo = doc.dates.to;
      const oldDuration = doc.durationDays;

      const newFrom = (dto as any).startDate ? new Date((dto as any).startDate) : oldFrom;
      const newTo = (dto as any).endDate ? new Date((dto as any).endDate) : oldTo;

      if (newFrom > newTo) throw new BadRequestException('startDate must be <= endDate');

      const newDuration = (newTo.getTime() - newFrom.getTime()) / 86400000 + 1;
      const delta = newDuration - oldDuration;

      // If duration increased, reserve more pending.
      // If duration decreased, release pending.
      if (delta > 0) {
        await this.reservePending(doc.employeeId as any, doc.leaveTypeId as any, delta);
      } else if (delta < 0) {
        await this.releasePending(doc.employeeId as any, doc.leaveTypeId as any, Math.abs(delta));
      }

      doc.dates.from = newFrom;
      doc.dates.to = newTo;
      doc.durationDays = newDuration;

      if ((dto as any).justification) doc.justification = (dto as any).justification;
      if ((dto as any).attachmentId) doc.attachmentId = new Types.ObjectId((dto as any).attachmentId);

      return doc.save();
    },

    cancel: async (id: string, requestedById?: string) => {
      const doc = await this.requestModel.findById(id).exec();
      if (!doc) throw new NotFoundException('Leave request not found');

      // If cancelling while pending, release reservation
      if (doc.status === LeaveStatus.PENDING) {
        await this.releasePending(doc.employeeId as any, doc.leaveTypeId as any, doc.durationDays);
      }

      // If cancelling an already approved request (optional behavior), revert taken
      if (doc.status === LeaveStatus.APPROVED) {
        await this.revertTaken(doc.employeeId as any, doc.leaveTypeId as any, doc.durationDays);
      }

      doc.status = LeaveStatus.CANCELLED;
      doc.approvalFlow.push({
        role: 'system',
        status: 'cancelled',
        decidedBy: requestedById ? new Types.ObjectId(requestedById) : undefined,
        decidedAt: new Date(),
      });

      return doc.save();
    },

    managerApprove: async (id: string, managerId: string) => {
      const doc = await this.requestModel.findById(id).exec();
      if (!doc) throw new NotFoundException('Leave request not found');

      if (doc.status !== LeaveStatus.PENDING)
        throw new BadRequestException('Request is not pending');

      // Consume pending into taken (prevents negative balance)
      await this.consumePendingToTaken(
        doc.employeeId as any,
        doc.leaveTypeId as any,
        doc.durationDays,
      );

      doc.status = LeaveStatus.APPROVED;
      doc.approvalFlow.push({
        role: 'manager',
        status: 'approved',
        decidedBy: new Types.ObjectId(managerId),
        decidedAt: new Date(),
      });

      return doc.save();
    },

    managerReject: async (id: string, managerId: string, reason?: string) => {
      const doc = await this.requestModel.findById(id).exec();
      if (!doc) throw new NotFoundException('Leave request not found');

      // If rejecting while pending, release reservation
      if (doc.status === LeaveStatus.PENDING) {
        await this.releasePending(doc.employeeId as any, doc.leaveTypeId as any, doc.durationDays);
      }

      doc.status = LeaveStatus.REJECTED;
      doc.approvalFlow.push({
        role: 'manager',
        status: reason ?? 'rejected',
        decidedBy: new Types.ObjectId(managerId),
        decidedAt: new Date(),
      });

      return doc.save();
    },

    /**
     * REQUIREMENT 2: BULK REQUEST PROCESSING (HR Manager)
     * IMPORTANT: Must be arrow function so `this.requestModel` works correctly.
     */
    bulkProcess: async (dto: BulkLeaveRequestDto) => {
      const results: LeaveRequestDocument[] = [];

      for (const item of dto.requests) {
        if (item.decision === 'APPROVED') {
          const res = await this.leaveRequest.managerApprove(item.id, dto.approverId);
          results.push(res);
        } else if (item.decision === 'REJECTED') {
          const res = await this.leaveRequest.managerReject(
            item.id,
            dto.approverId,
            item.reason,
          );
          results.push(res);
        }
      }

      return results;
    },

    /**
     * REQUIREMENT 3: FILTER REQUEST HISTORY (All Roles)
     * IMPORTANT: Must be arrow function so `this.requestModel` works correctly.
     */
    filter: async (params: FilterLeaveRequestsDto) => {
      const query: any = {};

      if (params.employeeId) query.employeeId = new Types.ObjectId(params.employeeId);
      if (params.status) query.status = params.status;
      if (params.leaveTypeId) query.leaveTypeId = new Types.ObjectId(params.leaveTypeId);

      if (params.startDate) query['dates.from'] = { $gte: new Date(params.startDate) };
      if (params.endDate) {
        query['dates.to'] = query['dates.to'] ?? {};
        query['dates.to'].$lte = new Date(params.endDate);
      }

      return this.requestModel.find(query).sort({ createdAt: -1 }).lean();
    },
  };

  // ============================================================
  // LEAVE ENTITLEMENT
  // ============================================================
  leaveEntitlement = {
    create: async (dto: CreateLeaveEntitlementDto) => {
      const exists = await this.entitlementModel.findOne({
        employeeId: new Types.ObjectId(dto.employeeId),
        leaveTypeId: new Types.ObjectId(dto.leaveTypeId),
        year: dto.year,
      });

      if (exists) throw new BadRequestException('Entitlement already exists.');

      const doc = new this.entitlementModel({
        employeeId: new Types.ObjectId(dto.employeeId),
        leaveTypeId: new Types.ObjectId(dto.leaveTypeId),
        yearlyEntitlement: dto.totalDays,
        carryForward: dto.carriedOverDays || 0,
        taken: 0,
        pending: 0,
        remaining: dto.totalDays + (dto.carriedOverDays || 0),
        accruedActual: 0,
        accruedRounded: 0,
      });

      return doc.save();
    },

    findAll: async () => this.entitlementModel.find().populate('leaveTypeId').lean(),

    findByEmployee: async (employeeId: string) =>
      this.entitlementModel
        .find({ employeeId: new Types.ObjectId(employeeId) })
        .populate('leaveTypeId')
        .lean(),

    update: async (employeeId: string, dto: UpdateLeaveEntitlementDto) => {
      const doc = await this.entitlementModel.findOne({
        employeeId: new Types.ObjectId(employeeId),
        leaveTypeId: new Types.ObjectId((dto as any).leaveTypeId),
      });

      if (!doc) throw new NotFoundException('Entitlement not found');

      if ((dto as any).totalDays !== undefined) doc.yearlyEntitlement = (dto as any).totalDays;
      if ((dto as any).usedDays !== undefined) doc.taken = (dto as any).usedDays;
      if ((dto as any).pendingDays !== undefined) doc.pending = (dto as any).pendingDays;

      this.recomputeRemaining(doc);

      if (doc.remaining < 0) throw new BadRequestException('Insufficient leave balance');

      return doc.save();
    },

    /**
     * Used by LeaveAdjustments; must not allow negative remaining.
     */
    adjustBalance: async (employeeId: string, leaveTypeId: string, deltaDays: number) => {
      const doc = await this.entitlementModel.findOne({
        employeeId: new Types.ObjectId(employeeId),
        leaveTypeId: new Types.ObjectId(leaveTypeId),
      });

      if (!doc) throw new NotFoundException('Entitlement not found');

      doc.taken += deltaDays;
      this.recomputeRemaining(doc);

      if (doc.remaining < 0) throw new BadRequestException('Insufficient leave balance');

      return doc.save();
    },

    removeByEmployee: async (employeeId: string) =>
      this.entitlementModel
        .deleteMany({ employeeId: new Types.ObjectId(employeeId) })
        .exec(),
  };

  // ============================================================
  // LEAVE ADJUSTMENT
  // ============================================================
  leaveAdjustment = {
    create: async (dto: CreateAdjustmentDto) => {
      const doc = new this.adjustmentModel({
        employeeId: new Types.ObjectId(dto.employeeId),
        leaveTypeId: new Types.ObjectId(dto.leaveTypeId),
        adjustmentType: dto.adjustmentType as AdjustmentType,
        amount: dto.amount,
        reason: dto.reason,
        hrUserId: new Types.ObjectId(dto.hrUserId),
      });

      return doc.save();
    },

    findAll: async () => this.adjustmentModel.find().lean(),

    findById: async (id: string) => {
      const doc = await this.adjustmentModel.findById(id).exec();
      if (!doc) throw new NotFoundException('Adjustment not found');
      return doc;
    },

    approve: async (id: string, dto: ApproveAdjustmentDto) => {
      const doc = await this.adjustmentModel.findById(id).exec();
      if (!doc) throw new NotFoundException('Adjustment not found');

      const delta = doc.adjustmentType === AdjustmentType.ADD ? doc.amount : -doc.amount;

      await this.leaveEntitlement.adjustBalance(
        doc.employeeId.toString(),
        doc.leaveTypeId.toString(),
        delta,
      );

      doc.hrUserId = new Types.ObjectId(dto.approverId);
      return doc.save();
    },
  };

  // ============================================================
  // CALENDAR
  // ============================================================
  calendar = {
    create: async (dto: CreateCalendarDto) => {
      const exists = await this.calendarModel.findOne({ year: dto.year }).exec();
      if (exists)
        throw new ConflictException(`Calendar for year ${dto.year} already exists`);
      return new this.calendarModel(dto).save();
    },

    findAll: async () => this.calendarModel.find().exec(),

    findByYear: async (year: number) => {
      const doc = await this.calendarModel.findOne({ year }).exec();
      if (!doc) throw new NotFoundException(`Calendar for year ${year} not found`);
      return doc;
    },

    update: async (year: number, dto: UpdateCalendarDto) => {
      const doc = await this.calendarModel
        .findOneAndUpdate({ year }, dto, { new: true })
        .exec();
      if (!doc) throw new NotFoundException(`Calendar for year ${year} not found`);
      return doc;
    },

    remove: async (year: number) => {
      const result = await this.calendarModel.findOneAndDelete({ year }).exec();
      if (!result) throw new NotFoundException(`Calendar for year ${year} not found`);
    },

    addBlockedPeriod: async (year: number, dto: CreateBlockedPeriodDto) => {
      const cal = await this.calendarModel.findOne({ year }).exec();
      if (!cal) throw new NotFoundException(`Calendar for year ${year} not found`);

      const start = new Date(dto.startDate);
      const end = new Date(dto.endDate);

      if (start > end) throw new BadRequestException('Start date must be before end date');

      cal.blockedPeriods.push({
        from: start,
        to: end,
        reason: dto.reason,
      });

      return cal.save();
    },

    removeBlockedPeriod: async (year: number, index: number) => {
      const cal = await this.calendarModel.findOne({ year }).exec();
      if (!cal) throw new NotFoundException(`Calendar for year ${year} not found`);

      if (index < 0 || index >= cal.blockedPeriods.length)
        throw new BadRequestException('Invalid blocked period index');

      cal.blockedPeriods.splice(index, 1);
      return cal.save();
    },
  };
}
