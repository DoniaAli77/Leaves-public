import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LeaveType, LeaveTypeDocument } from './schemas/leave-type.schema';
import { CreateLeaveTypeDto } from './dto/create-leave-type.dto';
import { UpdateLeaveTypeDto } from './dto/update-leave-type.dto';

@Injectable()
export class LeaveTypesService {
  constructor(
    @InjectModel(LeaveType.name)
    private leaveTypeModel: Model<LeaveTypeDocument>,
  ) {}

  async create(createLeaveTypeDto: CreateLeaveTypeDto): Promise<LeaveType> {
    const existingLeaveType = await this.leaveTypeModel.findOne({
      code: createLeaveTypeDto.code,
    });

    if (existingLeaveType) {
      throw new ConflictException(
        `Leave type with code '${createLeaveTypeDto.code}' already exists`,
      );
    }

    const createdLeaveType = new this.leaveTypeModel(createLeaveTypeDto);
    return createdLeaveType.save();
  }

  async findAll(): Promise<LeaveType[]> {
    return this.leaveTypeModel.find().exec();
  }

  async findActive(): Promise<LeaveType[]> {
    return this.leaveTypeModel.find({ isActive: true }).exec();
  }

  async findOne(id: string): Promise<LeaveType> {
    const leaveType = await this.leaveTypeModel.findById(id).exec();

    if (!leaveType) {
      throw new NotFoundException(`Leave type with ID '${id}' not found`);
    }

    return leaveType;
  }

  async findByCode(code: string): Promise<LeaveType> {
    const leaveType = await this.leaveTypeModel.findOne({ code }).exec();

    if (!leaveType) {
      throw new NotFoundException(`Leave type with code '${code}' not found`);
    }

    return leaveType;
  }

  async update(
    id: string,
    updateLeaveTypeDto: UpdateLeaveTypeDto,
  ): Promise<LeaveType> {
    if (updateLeaveTypeDto.code) {
      const existingLeaveType = await this.leaveTypeModel.findOne({
        code: updateLeaveTypeDto.code,
        _id: { $ne: id },
      });

      if (existingLeaveType) {
        throw new ConflictException(
          `Leave type with code '${updateLeaveTypeDto.code}' already exists`,
        );
      }
    }

    const updatedLeaveType = await this.leaveTypeModel
      .findByIdAndUpdate(id, updateLeaveTypeDto, { new: true })
      .exec();

    if (!updatedLeaveType) {
      throw new NotFoundException(`Leave type with ID '${id}' not found`);
    }

    return updatedLeaveType;
  }

  async remove(id: string): Promise<void> {
    const result = await this.leaveTypeModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`Leave type with ID '${id}' not found`);
    }
  }

  async deactivate(id: string): Promise<LeaveType> {
    const leaveType = await this.leaveTypeModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .exec();

    if (!leaveType) {
      throw new NotFoundException(`Leave type with ID '${id}' not found`);
    }

    return leaveType;
  }

  async activate(id: string): Promise<LeaveType> {
    const leaveType = await this.leaveTypeModel
      .findByIdAndUpdate(id, { isActive: true }, { new: true })
      .exec();

    if (!leaveType) {
      throw new NotFoundException(`Leave type with ID '${id}' not found`);
    }

    return leaveType;
  }
}
