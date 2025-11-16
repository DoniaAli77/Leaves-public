import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LeaveBalance, LeaveBalanceDocument } from '../schemas/leave-balance.schema';

/**
 * Very small accrual example:
 * - Each employee gets 1.5 annual days per month (example)
 * - You can modify accrual rules to be per grade in a real system
 */

@Injectable()
export class LeaveBalancesService {
  private readonly logger = new Logger(LeaveBalancesService.name);

  constructor(
    @InjectModel(LeaveBalance.name) private leaveBalanceModel: Model<LeaveBalanceDocument>,
  ) {}

  async getBalance(employeeId: string) {
    let b = await this.leaveBalanceModel.findOne({ employeeId });
    if (!b) {
      // default empty balance
      b = await this.leaveBalanceModel.create({
        employeeId,
        balances: {},
        pending: {},
        accrued: {},
        carryover: {},
      });
    }
    return b;
  }

  async addPending(employeeId: string, leaveType: string, days: number) {
    const doc = await this.getBalance(employeeId);
    const pending = { ...(doc.pending || {}) };
    pending[leaveType] = (pending[leaveType] || 0) + days;
    return this.leaveBalanceModel.findOneAndUpdate(
      { employeeId },
      { pending },
      { new: true, upsert: true },
    );
  }

  async applyApproved(employeeId: string, leaveType: string, days: number) {
    const doc = await this.getBalance(employeeId);
    const balances = { ...(doc.balances || {}) };
    balances[leaveType] = (balances[leaveType] || 0) - days;
    if (balances[leaveType] < 0) balances[leaveType] = 0;
    const pending = { ...(doc.pending || {}) };
    pending[leaveType] = Math.max(0, (pending[leaveType] || 0) - days);
    return this.leaveBalanceModel.findOneAndUpdate(
      { employeeId },
      { balances, pending },
      { new: true, upsert: true },
    );
  }

  async createOrUpdateBalance(employeeId: string, leaveType: string, amount: number) {
    // manual set or adjust
    const doc = await this.getBalance(employeeId);
    const balances = { ...(doc.balances || {}) };
    balances[leaveType] = amount;
    return this.leaveBalanceModel.findOneAndUpdate({ employeeId }, { balances }, { new: true, upsert: true });
  }

  async makeAdjustment(employeeId: string, leaveType: string, amount: number) {
    const doc = await this.getBalance(employeeId);
    const balances = { ...(doc.balances || {}) };
    balances[leaveType] = (balances[leaveType] || 0) + amount;
    const adj = await this.leaveBalanceModel.findOneAndUpdate({ employeeId }, { balances }, { new: true, upsert: true });
    return adj;
  }

  async runMonthlyAccrualForAll() {
    // simple naive accrual: +1.5 days ANNUAL per month
    this.logger.log('Running monthly accrual');
    const all = await this.leaveBalanceModel.find().exec();
    const promises = all.map(async (doc) => {
      const accrued = { ...(doc.accrued || {}) };
      const balances = { ...(doc.balances || {}) };
      const leaveType = 'ANNUAL';
      const add = 1.5;
      accrued[leaveType] = (accrued[leaveType] || 0) + add;
      balances[leaveType] = (balances[leaveType] || 0) + add;
      doc.accrued = accrued;
      doc.balances = balances;
      doc.lastAccrualDate = new Date();
      await doc.save();
    });
    await Promise.all(promises);
    return { ok: true, applied: all.length };
  }

  async runMonthlyAccrualForEmployee(employeeId: string) {
    // optional targeted accrual
    const doc = await this.getBalance(employeeId);
    const accrued = { ...(doc.accrued || {}) };
    const balances = { ...(doc.balances || {}) };
    const leaveType = 'ANNUAL';
    const add = 1.5;
    accrued[leaveType] = (accrued[leaveType] || 0) + add;
    balances[leaveType] = (balances[leaveType] || 0) + add;
    doc.accrued = accrued;
    doc.balances = balances;
    doc.lastAccrualDate = new Date();
    await doc.save();
    return doc;
  }
}
