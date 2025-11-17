import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  EmployeeLeaveBalance,
  EmployeeLeaveBalanceDocument,
} from './schemas/employee-leave-balance.schema';
import { CreateBalanceDto } from './dto/create-balance.dto';
import { UpdateBalanceDto } from './dto/update-balance.dto';

@Injectable()
export class EmployeeLeaveBalanceService {
  constructor(
    @InjectModel(EmployeeLeaveBalance.name)
    private balanceModel: Model<EmployeeLeaveBalanceDocument>,
  ) {}

  async create(createDto: CreateBalanceDto) {
    const doc = new this.balanceModel({
      employeeId: new Types.ObjectId(createDto.employeeId),
      balances: createDto.balances ?? {},
      pending: {},
      accrued: {},
      auditTrail: [{ action: 'created', at: new Date() }],
    });
    return doc.save();
  }

  async findAll() {
    return this.balanceModel.find().lean();
  }

  async findByEmployee(employeeId: string) {
    const doc = await this.balanceModel.findOne({
      employeeId: new Types.ObjectId(employeeId),
    });
    if (!doc) throw new NotFoundException('Balance not found for employee');
    return doc;
  }

  async update(employeeId: string, updateDto: UpdateBalanceDto) {
    const doc = await this.balanceModel.findOneAndUpdate(
      { employeeId: new Types.ObjectId(employeeId) },
      {
        $set: {
          ...(updateDto.balances ? { balances: updateDto.balances } : {}),
          ...(updateDto.pending ? { pending: updateDto.pending } : {}),
          ...(updateDto.accrued ? { accrued: updateDto.accrued } : {}),
        },
        $push: { auditTrail: { action: 'update', at: new Date() } },
      },
      { new: true, upsert: false },
    );
    if (!doc) throw new NotFoundException('Balance not found for employee');
    return doc;
  }

  async adjustBalance(employeeId: string, leaveType: string, delta: number) {
    // increment or decrement a specific leave type
    const doc = await this.balanceModel.findOne({
      employeeId: new Types.ObjectId(employeeId),
    });
    if (!doc) throw new NotFoundException('Balance not found');

    const current = (doc.balances.get(leaveType) as number) ?? 0;
    doc.balances.set(leaveType, current + delta);
    doc.auditTrail.push({ action: 'adjust', leaveType, delta, at: new Date() });
    return doc.save();
  }

  async removeByEmployee(employeeId: string) {
    return this.balanceModel.findOneAndDelete({
      employeeId: new Types.ObjectId(employeeId),
    });
  }
}