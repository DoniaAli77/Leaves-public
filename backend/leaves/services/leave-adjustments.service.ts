import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LeaveAdjustment, LeaveAdjustmentDocument } from '../schemas/leave-adjustment.schema';
import { LeaveBalancesService } from './leave-balances.service';

@Injectable()
export class LeaveAdjustmentsService {
  constructor(
    @InjectModel(LeaveAdjustment.name) private adjustmentsModel: Model<LeaveAdjustmentDocument>,
    private leaveBalancesService: LeaveBalancesService,
  ) {}

  async createAdjustment(payload: { employeeId: string; leaveType: string; amount: number; reason?: string; hrAdminId: string }) {
    const { employeeId, leaveType, amount, reason, hrAdminId } = payload;
    const adj = await this.adjustmentsModel.create({
      employeeId,
      leaveType,
      amount,
      reason,
      hrAdminId,
      auditTrail: [{ action: 'created', at: new Date(), by: hrAdminId, reason }],
    });
    // apply to balances
    await this.leaveBalancesService.makeAdjustment(employeeId, leaveType, amount);
    return adj;
  }

  async listAdjustments(employeeId: string) {
    return this.adjustmentsModel.find({ employeeId }).sort({ createdAt: -1 }).lean();
  }
}
