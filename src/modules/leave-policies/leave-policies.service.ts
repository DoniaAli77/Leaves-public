//src/modules/leave-policies/leave-policies.service.ts

import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LeavePolicy, LeavePolicyDocument } from './schemas/leave-policy.schema';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { UpdatePolicyDto } from './dto/update-policy.dto';

@Injectable()
export class LeavePoliciesService {
  constructor(
    @InjectModel(LeavePolicy.name)
    private policyModel: Model<LeavePolicyDocument>,
  ) {}

  async create(createPolicyDto: CreatePolicyDto): Promise<LeavePolicy> {
    const createdPolicy = new this.policyModel(createPolicyDto);
    return createdPolicy.save();
  }

  async findAll(): Promise<LeavePolicy[]> {
    return this.policyModel.find().exec();
  }

  async findActive(): Promise<LeavePolicy[]> {
    const now = new Date();
    return this.policyModel
      .find({
        isActive: true,
        $or: [
          { effectiveFrom: { $lte: now }, effectiveTo: { $gte: now } },
          { effectiveFrom: { $lte: now }, effectiveTo: null },
          { effectiveFrom: null, effectiveTo: null },
        ],
      })
      .exec();
  }

  async findByType(policyType: string): Promise<LeavePolicy[]> {
    return this.policyModel.find({ policyType, isActive: true }).exec();
  }

  async findOne(id: string): Promise<LeavePolicy> {
    const policy = await this.policyModel.findById(id).exec();

    if (!policy) {
      throw new NotFoundException(`Policy with ID '${id}' not found`);
    }

    return policy;
  }

  async update(
    id: string,
    updatePolicyDto: UpdatePolicyDto,
  ): Promise<LeavePolicy> {
    const updatedPolicy = await this.policyModel
      .findByIdAndUpdate(id, updatePolicyDto, { new: true })
      .exec();

    if (!updatedPolicy) {
      throw new NotFoundException(`Policy with ID '${id}' not found`);
    }

    return updatedPolicy;
  }

  async remove(id: string): Promise<void> {
    const result = await this.policyModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`Policy with ID '${id}' not found`);
    }
  }

  async deactivate(id: string): Promise<LeavePolicy> {
    const policy = await this.policyModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .exec();

    if (!policy) {
      throw new NotFoundException(`Policy with ID '${id}' not found`);
    }

    return policy;
  }

  async activate(id: string): Promise<LeavePolicy> {
    const policy = await this.policyModel
      .findByIdAndUpdate(id, { isActive: true }, { new: true })
      .exec();

    if (!policy) {
      throw new NotFoundException(`Policy with ID '${id}' not found`);
    }

    return policy;
  }
}