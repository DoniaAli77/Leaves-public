import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LeaveEntitlement, LeaveEntitlementDocument } from './schemas/leave-entitlement.schema';
import { CreateLeaveEntitlementDto } from './dto/create-leave-entitlement.dto';
import { UpdateLeaveEntitlementDto } from './dto/update-leave-entitlement.dto';

@Injectable()
export class LeaveEntitlementsService {
  constructor(
    @InjectModel(LeaveEntitlement.name)
    private entitlementModel: Model<LeaveEntitlementDocument>,
  ) {}

  // 1. Create a new entitlement
  async create(createDto: CreateLeaveEntitlementDto): Promise<LeaveEntitlement> {
    const existing = await this.entitlementModel.findOne({
      employeeId: new Types.ObjectId(createDto.employeeId),
      leaveTypeId: new Types.ObjectId(createDto.leaveTypeId),
      year: createDto.year, // Note: You might need to add 'year' to your schema if you track it
    });

    if (existing) {
      throw new BadRequestException('Entitlement already exists.');
    }

    const doc = new this.entitlementModel({
      employeeId: new Types.ObjectId(createDto.employeeId),
      leaveTypeId: new Types.ObjectId(createDto.leaveTypeId),
      yearlyEntitlement: createDto.totalDays, // Mapped from DTO
      carryForward: createDto.carriedOverDays || 0, // Mapped from DTO
      taken: 0,
      pending: 0,
      remaining: (createDto.totalDays + (createDto.carriedOverDays || 0)),
      accruedActual: 0,
      accruedRounded: 0
    });

    return doc.save();
  }

  // 2. Find all
  async findAll(): Promise<LeaveEntitlement[]> {
    return this.entitlementModel
      .find()
      .populate('leaveTypeId') // Populates the reference
      .lean();
  }

  // 3. Find by Employee
  async findByEmployee(employeeId: string): Promise<LeaveEntitlement[]> {
    return this.entitlementModel
      .find({ employeeId: new Types.ObjectId(employeeId) })
      .populate('leaveTypeId');
  }

  // 4. Update
  async update(employeeId: string, updateDto: UpdateLeaveEntitlementDto): Promise<LeaveEntitlement> {
    const doc = await this.entitlementModel.findOne({
      employeeId: new Types.ObjectId(employeeId),
      leaveTypeId: new Types.ObjectId(updateDto.leaveTypeId),
    });

    if (!doc) throw new NotFoundException('Entitlement not found');

    // Update fields using YOUR schema names
    if (updateDto.totalDays !== undefined) doc.yearlyEntitlement = updateDto.totalDays;
    if (updateDto.usedDays !== undefined) doc.taken = updateDto.usedDays;
    if (updateDto.pendingDays !== undefined) doc.pending = updateDto.pendingDays;
    
    // Recalculate Remaining: (Entitlement + Carry) - Taken - Pending
    doc.remaining = (doc.yearlyEntitlement + doc.carryForward) - doc.taken - doc.pending;

    return doc.save();
  }

  // 5. Adjust Balance (for approved requests)
  async adjustBalance(employeeId: string, leaveTypeId: string, deltaDays: number): Promise<LeaveEntitlement> {
    const doc = await this.entitlementModel.findOne({
      employeeId: new Types.ObjectId(employeeId),
      leaveTypeId: new Types.ObjectId(leaveTypeId),
    });

    if (!doc) throw new NotFoundException('Entitlement not found');

    // If delta is positive (cancelling leave), we reduce 'taken'
    // If delta is negative (taking leave), we increase 'taken'
    // Usually, this function receives "days to deduct". Let's assume input is positive for taking days.
    
    doc.taken = doc.taken + deltaDays;
    
    // Recalculate remaining
    doc.remaining = (doc.yearlyEntitlement + doc.carryForward) - doc.taken - doc.pending;

    if (doc.remaining < 0) {
      throw new BadRequestException('Insufficient leave balance');
    }

    return doc.save();
  }

  async removeByEmployee(employeeId: string): Promise<any> {
    return this.entitlementModel.deleteMany({
      employeeId: new Types.ObjectId(employeeId),
    });
       }
  }
