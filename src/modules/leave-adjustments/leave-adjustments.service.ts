import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LeaveAdjustment, LeaveAdjustmentDocument } from './schemas/leave-adjustment.schema';
import { CreateAdjustmentDto } from './dto/create-adjustment.dto';
import { ApproveAdjustmentDto } from './dto/approve-adjustment.dto';
import { EmployeeLeaveBalanceService } from '../employee-leave-balance/employee-leave-balance.service';

@Injectable()
export class LeaveAdjustmentsService {
  constructor(
    @InjectModel(LeaveAdjustment.name)
    private adjModel: Model<LeaveAdjustmentDocument>,
    // optional: connect to balance service to apply approved adjustments
    private readonly balanceService?: EmployeeLeaveBalanceService,
  ) {}

  async create(dto: CreateAdjustmentDto) {
    const doc = new this.adjModel({
      employeeId: new Types.ObjectId(dto.employeeId),
      leaveTypeCode: dto.leaveTypeCode,
      days: dto.days,
      reason: dto.reason,
      status: 'pending',
      auditTrail: [{ action: 'created', at: new Date() }],
    });
    return doc.save();
  }

  async findAll() {
    return this.adjModel.find().lean();
  }

  async findById(id: string) {
    const doc = await this.adjModel.findById(id);
    if (!doc) throw new NotFoundException('Adjustment not found');
    return doc;
  }

  async approve(id: string, dto: ApproveAdjustmentDto) {
    const doc = await this.adjModel.findById(id);
    if (!doc) throw new NotFoundException('Adjustment not found');
    if (doc.status !== 'pending') throw new BadRequestException('Already processed');

    doc.status = 'approved';
    doc.approverId = new Types.ObjectId(dto.approverId);
    doc.auditTrail.push({ action: 'approved', by: dto.approverId, comment: dto.comment, at: new Date() });
    await doc.save();

    // apply to balances if service available
    if (this.balanceService) {
      // note: adjustBalance expects delta: +days or -days
      await this.balanceService.adjustBalance(doc.employeeId.toString(), doc.leaveTypeCode, doc.days);
    }

    return doc;
  }

  async reject(id: string, approverId: string, reason?: string) {
    const doc = await this.adjModel.findById(id);
    if (!doc) throw new NotFoundException('Adjustment not found');
    doc.status = 'rejected';
    doc.approverId = new Types.ObjectId(approverId);
    doc.auditTrail.push({ action: 'rejected', by: approverId, reason, at: new Date() });
    return doc.save();
  }
}
