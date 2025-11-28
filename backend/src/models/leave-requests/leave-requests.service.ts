import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  LeaveRequest,
  LeaveRequestDocument,
} from './schemas/leave-request.schema';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { UpdateLeaveRequestDto } from './dto/update-leave-request.dto';
import { LeaveStatus } from '../../enums/leave-status.enum';

@Injectable()
export class LeaveRequestsService {
  constructor(
    @InjectModel(LeaveRequest.name)
    private requestModel: Model<LeaveRequestDocument>,
  ) {}

  // CREATE -----------------------------------------------------
  async create(dto: CreateLeaveRequestDto) {
    const from = new Date(dto.startDate);
    const to = new Date(dto.endDate);

    if (from > to) {
      throw new BadRequestException('startDate must be <= endDate');
    }

    const durationDays =
      (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24) + 1;

    const doc = new this.requestModel({
      employeeId: new Types.ObjectId(dto.employeeId),
      leaveTypeId: new Types.ObjectId(dto.leaveTypeId),

      dates: { from, to },
      durationDays,

      justification: dto.justification,

      attachmentId: dto.attachmentId
        ? new Types.ObjectId(dto.attachmentId)
        : undefined,

      approvalFlow: [],

      status: LeaveStatus.PENDING,

      irregularPatternFlag: false, // optional business logic
    });

    return doc.save();
  }

  // READ -------------------------------------------------------
  async findAll() {
    return this.requestModel.find().lean();
  }

  async findByEmployee(employeeId: string) {
    return this.requestModel
      .find({
        employeeId: new Types.ObjectId(employeeId),
      })
      .sort({ createdAt: -1 })
      .lean();
  }

  async findOne(id: string) {
    const doc = await this.requestModel.findById(id);
    if (!doc) throw new NotFoundException('Leave request not found');
    return doc;
  }

  // UPDATE -----------------------------------------------------
  async update(id: string, dto: UpdateLeaveRequestDto) {
    const updatePayload: any = {};

    if (dto.startDate)
      updatePayload['dates.from'] = new Date(dto.startDate);

    if (dto.endDate)
      updatePayload['dates.to'] = new Date(dto.endDate);

    if (dto.startDate || dto.endDate) {
      const from = dto.startDate
        ? new Date(dto.startDate)
        : undefined;

      const to = dto.endDate ? new Date(dto.endDate) : undefined;

      if (from && to && from > to) {
        throw new BadRequestException('startDate must be <= endDate');
      }
    }

    if (dto.justification)
      updatePayload.justification = dto.justification;

    if (dto.attachmentId)
      updatePayload.attachmentId = new Types.ObjectId(dto.attachmentId);

    const doc = await this.requestModel.findByIdAndUpdate(
      id,
      { $set: updatePayload },
      { new: true },
    );

    if (!doc) throw new NotFoundException('Leave request not found');

    return doc;
  }

  // CANCEL -----------------------------------------------------
  async cancel(id: string, requestedById?: string) {
    const doc = await this.requestModel.findById(id);
    if (!doc) throw new NotFoundException('Leave request not found');

    doc.status = LeaveStatus.CANCELLED;

    doc.approvalFlow.push({
      role: 'system',
      status: 'cancelled',
      decidedBy: requestedById
        ? new Types.ObjectId(requestedById)
        : undefined,
      decidedAt: new Date(),
    });

    return doc.save();
  }

  // MANAGER APPROVE (SINGLE-STAGE) -----------------------------
  async managerApprove(id: string, managerId: string) {
    const doc = await this.requestModel.findById(id);
    if (!doc) throw new NotFoundException('Leave request not found');

    if (doc.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Request is not pending');
    }

    doc.status = LeaveStatus.APPROVED;

    doc.approvalFlow.push({
      role: 'manager',
      status: 'approved',
      decidedBy: new Types.ObjectId(managerId),
      decidedAt: new Date(),
    });

    return doc.save();
  }

  // MANAGER REJECT --------------------------------------------
  async managerReject(id: string, managerId: string, reason?: string) {
    const doc = await this.requestModel.findById(id);
    if (!doc) throw new NotFoundException('Leave request not found');

    doc.status = LeaveStatus.REJECTED;

    doc.approvalFlow.push({
      role: 'manager',
      status: reason ?? 'rejected',
      decidedBy: new Types.ObjectId(managerId),
      decidedAt: new Date(),
    });

    return doc.save();
  }
}
