import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LeaveRequest, LeaveRequestDocument } from './schemas/leave-request.schema';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { UpdateLeaveRequestDto } from './dto/update-leave-request.dto';

@Injectable()
export class LeaveRequestsService {
  constructor(
    @InjectModel(LeaveRequest.name)
    private requestModel: Model<LeaveRequestDocument>,
  ) {}

  async create(dto: CreateLeaveRequestDto) {
    // basic validation: start <= end
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    if (start > end) throw new BadRequestException('startDate must be <= endDate');

    const doc = new this.requestModel({
      employeeId: new Types.ObjectId(dto.employeeId),
      leaveTypeCode: dto.leaveTypeCode,
      startDate: start,
      endDate: end,
      justification: dto.justification,
      documentUrl: dto.documentUrl,
      status: 'pending',
      auditTrail: [{ action: 'created', at: new Date() }],
    });
    return doc.save();
  }

  async findAll() {
    return this.requestModel.find().lean();
  }

  async findByEmployee(employeeId: string) {
    return this.requestModel
      .find({ employeeId: new Types.ObjectId(employeeId) })
      .sort({ createdAt: -1 })
      .lean();
  }

  async findOne(id: string) {
    const doc = await this.requestModel.findById(id);
    if (!doc) throw new NotFoundException('Leave request not found');
    return doc;
  }

  async update(id: string, dto: UpdateLeaveRequestDto) {
    const doc = await this.requestModel.findByIdAndUpdate(
      id,
      {
        $set: {
          ...(dto.startDate ? { startDate: new Date(dto.startDate) } : {}),
          ...(dto.endDate ? { endDate: new Date(dto.endDate) } : {}),
          ...(dto.justification ? { justification: dto.justification } : {}),
          ...(dto.documentUrl ? { documentUrl: dto.documentUrl } : {}),
        },
        $push: { auditTrail: { action: 'update', at: new Date() } },
      },
      { new: true },
    );
    if (!doc) throw new NotFoundException('Leave request not found');
    return doc;
  }

  async cancel(id: string, requestedById?: string) {
    const doc = await this.requestModel.findById(id);
    if (!doc) throw new NotFoundException('Leave request not found');
    doc.status = 'cancelled';
    doc.auditTrail.push({ action: 'cancelled', by: requestedById ?? 'system', at: new Date() });
    return doc.save();
  }

  // Manager approval - stage 1
  async managerApprove(id: string, managerId: string) {
    const doc = await this.requestModel.findById(id);
    if (!doc) throw new NotFoundException('Leave request not found');
    if (doc.status !== 'pending') throw new BadRequestException('Request not pending');
    doc.status = 'approved'; // for simplicity manager approval goes final; you can add multi-stage if needed
    doc.managerId = new Types.ObjectId(managerId);
    doc.auditTrail.push({ action: 'manager_approved', by: managerId, at: new Date() });
    return doc.save();
  }

  // Manager reject
  async managerReject(id: string, managerId: string, reason?: string) {
    const doc = await this.requestModel.findById(id);
    if (!doc) throw new NotFoundException('Leave request not found');
    doc.status = 'rejected';
    doc.managerId = new Types.ObjectId(managerId);
    doc.auditTrail.push({ action: 'manager_rejected', by: managerId, reason, at: new Date() });
    return doc.save();
  }
}
