import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LeavePolicy, LeavePolicyDocument } from './schemas/leave-policy.schema';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { UpdatePolicyDto } from './dto/update-policy.dto';

@Injectable()
export class LeavePoliciesService {
  constructor(
    @InjectModel(LeavePolicy.name)
    private policyModel: Model<LeavePolicyDocument>,
  ) {}

  async create(dto: CreatePolicyDto): Promise<LeavePolicy> {
    const doc = new this.policyModel({
      ...dto,
      leaveTypeId: new Types.ObjectId(dto.leaveTypeId),
    });

    return doc.save();
  }

  async findAll(): Promise<LeavePolicy[]> {
    return this.policyModel.find().exec();
  }

  // NEW: find only active policies based on isActive + effective dates
  async findActive(): Promise<LeavePolicy[]> {
    const now = new Date();
    return this.policyModel.find({
      isActive: true,
      $or: [
        { effectiveFrom: { $lte: now }, effectiveTo: { $gte: now } },
        { effectiveFrom: { $lte: now }, effectiveTo: null },
        { effectiveFrom: null, effectiveTo: null },
      ],
    }).exec();
  }

  // NEW: find policies by policyType
  async findByType(policyType: string): Promise<LeavePolicy[]> {
    return this.policyModel.find({ policyType, isActive: true }).exec();
  }

  async findOne(id: string): Promise<LeavePolicy> {
    const policy = await this.policyModel.findById(id).exec();
    if (!policy) throw new NotFoundException(`Policy with ID '${id}' not found`);
    return policy;
  }

  async update(id: string, dto: UpdatePolicyDto): Promise<LeavePolicy> {
    const updated = await this.policyModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!updated) throw new NotFoundException(`Policy with ID '${id}' not found`);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.policyModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException(`Policy with ID '${id}' not found`);
  }

  // NEW: activate policy
  async activate(id: string): Promise<LeavePolicy> {
    const policy = await this.policyModel.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true },
    ).exec();
    if (!policy) throw new NotFoundException(`Policy with ID '${id}' not found`);
    return policy;
  }

  // NEW: deactivate policy
  async deactivate(id: string): Promise<LeavePolicy> {
    const policy = await this.policyModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true },
    ).exec();
    if (!policy) throw new NotFoundException(`Policy with ID '${id}' not found`);
    return policy;
  }
}
