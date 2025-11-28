import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LeaveAdjustment, LeaveAdjustmentDocument } from './schemas/leave-adjustment.schema';
import { CreateAdjustmentDto } from './dto/create-adjustment.dto';
import { ApproveAdjustmentDto } from './dto/approve-adjustment.dto';
import { LeaveEntitlementsService } from '../leave-entitlements/leave-entitlements.service';
import { AdjustmentType } from '../../enums/adjustment-type.enum';

@Injectable()
export class LeaveAdjustmentsService {
  constructor(
    @InjectModel(LeaveAdjustment.name)
    private adjModel: Model<LeaveAdjustmentDocument>,

    private readonly balanceService?: LeaveEntitlementsService,
  ) {}

  // ---------------------------------------------------
  // CREATE
  // ---------------------------------------------------
  async create(dto: CreateAdjustmentDto) {
    const doc = new this.adjModel({
      employeeId: new Types.ObjectId(dto.employeeId),
      leaveTypeId: new Types.ObjectId(dto.leaveTypeId),
      adjustmentType: dto.adjustmentType as AdjustmentType,
      amount: dto.amount,
      reason: dto.reason,
      hrUserId: new Types.ObjectId(dto.hrUserId),
    });

    return doc.save();
  }

  // ---------------------------------------------------
  // FIND ALL
  // ---------------------------------------------------
  async findAll() {
    return this.adjModel.find().lean();
  }

  // ---------------------------------------------------
  // FIND ONE
  // ---------------------------------------------------
  async findById(id: string) {
    const doc = await this.adjModel.findById(id);
    if (!doc) throw new NotFoundException('Adjustment not found');
    return doc;
  }

  // ---------------------------------------------------
  // APPROVE / APPLY ADJUSTMENT
  // ---------------------------------------------------
  async approve(id: string, dto: ApproveAdjustmentDto) {
    const doc = await this.adjModel.findById(id);
    if (!doc) throw new NotFoundException('Adjustment not found');

    if (!this.balanceService) {
      throw new BadRequestException('Balance service not available');
    }

    const delta = doc.adjustmentType === AdjustmentType.ADD
      ? doc.amount
      : -doc.amount;

    await this.balanceService.adjustBalance(
      doc.employeeId.toString(),
      doc.leaveTypeId.toString(),
      delta,
    );

    // Optional: store approver if needed
    doc.hrUserId = new Types.ObjectId(dto.approverId);
    await doc.save();

    return doc;
  }

  // ---------------------------------------------------
  // REJECT (OPTIONAL - ONLY IF YOU WANT A REJECT FLOW)
  /*---------------------------------------------------
  async reject(id: string) {
    throw new BadRequestException(
      'Reject flow not supported by current schema (no status field).',
    );
  }*/
}
