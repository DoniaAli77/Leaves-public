import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  EmployeeProfile,
  EmployeeProfileDocument,
} from './models/employee-profile.schema';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { SelfUpdateDto } from './dto/self-update.dto';
import { EmployeeProfileChangeRequest } from './models/ep-change-request.schema';
import { CreateChangeRequestDto } from './dto/create-change-request.dto';
import { EmployeeStatus, ProfileChangeStatus } from './enums/employee-profile.enums';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EmployeeProfileService {
  constructor(
    @InjectModel(EmployeeProfile.name)
    private readonly employeeModel: Model<EmployeeProfileDocument>,

    @InjectModel(EmployeeProfileChangeRequest.name)
    private readonly changeRequestModel: Model<EmployeeProfileChangeRequest>,
  ) {}

  /**
   * ✅ Project-level guardrail for updates:
   * - runValidators: enforce schema validation on update queries
   * - context: 'query': needed for certain validators/plugins
   */
  private readonly UPDATE_OPTS = {
    new: true,
    runValidators: true,
    context: 'query' as const,
  };

  /**
   * Convert a string (from DTO / JSON) into a real Mongo ObjectId,
   * but only if it was provided.
   *
   * Why: your schema uses Types.ObjectId for these fields, but DTOs use string.
   * If you store strings, equality checks fail (string !== ObjectId),
   * and team queries break.
   */
  private toObjectIdOrUndefined(fieldName: string, value?: string) {
    if (value === undefined || value === null || value === '') return undefined;

    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(
        `${fieldName} must be a valid MongoId (24 hex chars)`,
      );
    }
    return new Types.ObjectId(value);
  }

  /**
   * Some fields in EmployeeProfile are ObjectId typed in schema.
   * This method ensures we always write correct ObjectId values.
   */
  private normalizeOrgLinks(payload: any) {
    if (payload.primaryPositionId !== undefined) {
      payload.primaryPositionId = this.toObjectIdOrUndefined(
        'primaryPositionId',
        payload.primaryPositionId,
      );
    }
    if (payload.supervisorPositionId !== undefined) {
      payload.supervisorPositionId = this.toObjectIdOrUndefined(
        'supervisorPositionId',
        payload.supervisorPositionId,
      );
    }
    if (payload.primaryDepartmentId !== undefined) {
      payload.primaryDepartmentId = this.toObjectIdOrUndefined(
        'primaryDepartmentId',
        payload.primaryDepartmentId,
      );
    }
    return payload;
  }

  // -------- CREATE (HR / Admin) --------
  async create(createDto: CreateEmployeeDto) {
    const payload: any = { ...createDto };

    // convert dates
    payload.dateOfHire = new Date(createDto.dateOfHire);
    payload.contractStartDate = createDto.contractStartDate
      ? new Date(createDto.contractStartDate)
      : undefined;
    payload.contractEndDate = createDto.contractEndDate
      ? new Date(createDto.contractEndDate)
      : undefined;

    // ✅ CRITICAL: Convert org structure links to ObjectId
    this.normalizeOrgLinks(payload);

    const created = new this.employeeModel(payload);
    return created.save();
  }

  // -------- READ ALL --------
  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    return this.employeeModel
      .find()
      .skip(skip)
      .limit(limit)
      .populate('primaryDepartmentId')
      .populate('primaryPositionId')
      .populate('supervisorPositionId')
      .lean();
  }

  // -------- READ ONE --------
  async findOne(id: string) {
    const employee = await this.employeeModel
      .findById(id)
      .populate('primaryDepartmentId')
      .populate('primaryPositionId')
      .populate('supervisorPositionId')
      .lean();

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return employee;
  }

  // -------- SET / CHANGE PASSWORD (HR/Admin) --------
  async setPassword(id: string, password: string) {
    const employee = await this.employeeModel.findById(id);
    if (!employee) {
      throw new NotFoundException('Employee not found 🧑‍🏫');
    }

    const hashed = await bcrypt.hash(password, 10);

    await this.employeeModel.findByIdAndUpdate(
      id,
      { password: hashed },
      this.UPDATE_OPTS,
    );

    return { message: 'Password updated successfully 🔐', id };
  }

  // -------- UPDATE (HR / Admin) --------
  async update(id: string, updateDto: UpdateEmployeeDto) {
    const payload: any = { ...updateDto };

    // convert dates if provided
    if (updateDto.dateOfHire) payload.dateOfHire = new Date(updateDto.dateOfHire);
    if (updateDto.contractStartDate)
      payload.contractStartDate = new Date(updateDto.contractStartDate);
    if (updateDto.contractEndDate)
      payload.contractEndDate = new Date(updateDto.contractEndDate);

    // ✅ CRITICAL: Convert org structure links to ObjectId
    this.normalizeOrgLinks(payload);

    const updated = await this.employeeModel
      .findByIdAndUpdate(id, payload, this.UPDATE_OPTS)
      .lean();

    if (!updated) {
      throw new NotFoundException('Employee not found');
    }

    return updated;
  }

  // -------- DEACTIVATE (NOT DELETE) --------
  async deactivate(id: string) {
    const employee = await this.employeeModel.findById(id);
    if (!employee) {
      throw new NotFoundException('Employee not found 🧑‍🏫');
    }

    const oldStatus = employee.status;

    const updated = await this.employeeModel
      .findByIdAndUpdate(
        id,
        { status: EmployeeStatus.INACTIVE },
        this.UPDATE_OPTS,
      )
      .lean();

    return {
      message: 'Employee is now deactivated 😴',
      id,
      oldStatus,
      newStatus: EmployeeStatus.INACTIVE,
      updatedEmployee: updated,
    };
  }

  // ================================
  // EMPLOYEE SELF-SERVICE UPDATE
  // ================================
  async selfUpdate(employeeId: string, dto: SelfUpdateDto) {
    const allowed = ['phone', 'personalEmail', 'workEmail', 'biography', 'address'];

    const payload: any = {};
    for (const key of allowed) {
      if ((dto as any)[key] !== undefined) {
        payload[key] = (dto as any)[key];
      }
    }

    const updated = await this.employeeModel
      .findByIdAndUpdate(employeeId, payload, this.UPDATE_OPTS)
      .lean();

    if (!updated) {
      throw new NotFoundException('Employee not found');
    }

    return updated;
  }

  // ================================
  // CREATE CHANGE REQUEST (Employee)
  // ================================
  async createChangeRequest(employeeId: string, dto: CreateChangeRequestDto) {
    if (!dto) {
      throw new UnauthorizedException('Request body is empty ❌');
    }

    const employee = await this.employeeModel.findById(employeeId);
    if (!employee) {
      throw new NotFoundException('Employee not found ❌');
    }

    const profileId = dto.employeeProfileId;
    if (!profileId) {
      throw new ForbiddenException('employeeProfileId is required in body ❌');
    }

    const ALLOWED_FIELDS: CreateChangeRequestDto['field'][] = [
      'firstName',
      'lastName',
      'nationalId',
      'primaryPositionId',
      'primaryDepartmentId',
      'contractType',
      'workType',
    ];

    if (!ALLOWED_FIELDS.includes(dto.field)) {
      throw new ForbiddenException(`Invalid field '${dto.field}' ❌`);
    }

    const requestId = randomUUID();
    const requestDescription = JSON.stringify({
      field: dto.field,
      newValue: dto.newValue,
      reason: dto.reason ?? '',
    });

    const created = new this.changeRequestModel({
      requestId,
      employeeProfileId: profileId,
      field: dto.field,
      newValue: dto.newValue,
      reason: dto.reason ?? '',
      requestDescription,
      status: ProfileChangeStatus.PENDING,
      submittedAt: new Date(),
    });

    return created.save();
  }

  // ================================
  // GET ALL REQUESTS FOR EMPLOYEE
  // ================================
  async getEmployeeChangeRequests(employeeProfileId: string) {
    return this.changeRequestModel
      .find({ employeeProfileId })
      .sort({ submittedAt: -1 })
      .lean();
  }

  // ================================
  // HR APPROVES REQUEST
  // ================================
  async approveChangeRequest(changeRequestMongoId: string) {
    const request = await this.changeRequestModel.findById(changeRequestMongoId);
    if (!request) {
      throw new NotFoundException('Change request not found ❌');
    }

    const raw = (request as any).requestDescription;
    let data: { field: string; newValue: string; reason?: string };

    if (typeof raw === 'string') {
      if (raw.trim().startsWith('{')) {
        try {
          data = JSON.parse(raw);
        } catch {
          throw new BadRequestException(
            'Corrupted requestDescription JSON ❌ – please recreate this change request',
          );
        }
      } else {
        data = {
          field: (request as any).field,
          newValue: (request as any).newValue,
          reason: raw,
        };
      }
    } else {
      data = raw as any;
    }

    if (!data.field || !data.newValue) {
      throw new BadRequestException(
        'Change request is missing field/newValue ❌ – please create a new one',
      );
    }

    const employeeProfileId = (request as any).employeeProfileId;
    const employee = await this.employeeModel.findById(employeeProfileId);
    if (!employee) {
      throw new NotFoundException('Employee not found ❌');
    }

    // nationalId uniqueness check
    if (data.field === 'nationalId') {
      if (employee.nationalId === data.newValue) {
        await this.changeRequestModel.findByIdAndUpdate(changeRequestMongoId, {
          status: ProfileChangeStatus.APPROVED,
        });
        return {
          message:
            'No update needed – nationalId already has this value, request marked APPROVED ✅',
        };
      }

      const duplicate = await this.employeeModel.findOne({
        nationalId: data.newValue,
      });
      if (duplicate) {
        throw new BadRequestException(
          'Cannot approve – another employee already has this nationalId ❌',
        );
      }
    }

    // ✅ CRITICAL: if HR is approving ObjectId fields, store as ObjectId not string
    let newValueToWrite: any = data.newValue;

    if (
      data.field === 'primaryPositionId' ||
      data.field === 'supervisorPositionId' ||
      data.field === 'primaryDepartmentId'
    ) {
      newValueToWrite = this.toObjectIdOrUndefined(data.field, data.newValue);
    }

    await this.employeeModel.findByIdAndUpdate(
      employeeProfileId,
      { [data.field]: newValueToWrite },
      this.UPDATE_OPTS,
    );

    await this.changeRequestModel.findByIdAndUpdate(changeRequestMongoId, {
      status: ProfileChangeStatus.APPROVED,
    });

    return { message: 'Change request approved and employee updated ✅' };
  }

  async rejectChangeRequest(id: string, reason: string) {
    const request = await this.changeRequestModel.findById(id);
    if (!request) throw new NotFoundException('Request not found');

    request.status = ProfileChangeStatus.REJECTED;
    request.processedAt = new Date();
    request.reason = reason;

    return request.save();
  }

  // Manager sees list of employees reporting to them (only summary)
  async getTeamSummaryForManager(managerEmployeeId: string) {
    const manager = await this.employeeModel.findById(managerEmployeeId).lean();
    if (!manager) {
      throw new NotFoundException('Manager not found');
    }

    if (!manager.primaryPositionId) {
      throw new BadRequestException('Manager has no primaryPositionId');
    }

    return this.employeeModel
      .find({ supervisorPositionId: manager.primaryPositionId })
      .select('firstName lastName primaryDepartmentId primaryPositionId status')
      .populate('primaryDepartmentId')
      .populate('primaryPositionId')
      .lean();
  }

  // ✅ Manager uses EMPLOYEE ID (from JWT), but team is linked by POSITION ID.
  async getTeamSummaryForManagerEmployeeId(managerEmployeeId: string) {
    const manager = await this.employeeModel
      .findById(managerEmployeeId)
      .select('_id primaryPositionId')
      .lean();

    if (!manager) {
      throw new NotFoundException('Manager profile not found');
    }

    if (!manager.primaryPositionId) {
      throw new BadRequestException('Manager has no primaryPositionId set');
    }

    const team = await this.employeeModel
      .find({ supervisorPositionId: manager.primaryPositionId })
      .select(
        '_id employeeNumber firstName lastName primaryDepartmentId primaryPositionId supervisorPositionId status',
      )
      .lean();

    return team.map((m: any) => ({
      ...m,
      employeeName: `${m.firstName ?? ''} ${m.lastName ?? ''}`.trim(),
    }));
  }

  // Manager sees one employee but must belong to their team
  async getTeamEmployeeSummary(managerEmployeeId: string, employeeId: string) {
    const manager = await this.employeeModel
      .findById(managerEmployeeId)
      .select('_id primaryPositionId')
      .lean();

    if (!manager) throw new NotFoundException('Manager not found');
    if (!manager.primaryPositionId)
      throw new BadRequestException('Manager has no primaryPositionId');

    const employee = await this.employeeModel
      .findOne({
        _id: employeeId,
        supervisorPositionId: manager.primaryPositionId,
      })
      // ✅ your schema uses "status" everywhere else
      .select('firstName lastName primaryDepartmentId primaryPositionId status')
      .populate('primaryDepartmentId', 'name')
      .populate('primaryPositionId', 'title')
      .lean();

    if (!employee) {
      throw new NotFoundException('Employee not found in your team');
    }

    return employee;
  }

  async getAllChangeRequests() {
    return this.changeRequestModel.find().sort({ submittedAt: -1 }).lean();
  }

  async findChangeRequestByUUID(requestId: string) {
    const request = await this.changeRequestModel.findOne({ requestId }).lean();
    if (!request) {
      throw new NotFoundException('Request not found');
    }
    return request;
  }

  // Dispute logic
  async submitDispute(dto: {
    employeeProfileId: string;
    originalRequestId: string;
    dispute: string;
  }) {
    const requestId = randomUUID();

    const created = new this.changeRequestModel({
      requestId,
      employeeProfileId: dto.employeeProfileId,
      requestDescription: `disputeFor:${dto.originalRequestId}`,
      reason: dto.dispute,
      status: ProfileChangeStatus.PENDING,
      submittedAt: new Date(),
    });

    return created.save();
  }

  async withdrawChangeRequest(id: string) {
    const request = await this.changeRequestModel.findById(id);
    if (!request) throw new NotFoundException('Request not found');

    if (request.status !== ProfileChangeStatus.PENDING) {
      throw new Error('Only pending requests can be withdrawn');
    }

    request.status = ProfileChangeStatus.REJECTED;
    request.reason = 'Withdrawn by employee';
    request.processedAt = new Date();

    await request.save();

    return {
      message: 'Change request withdrawn successfully',
      requestId: request.requestId,
      status: request.status,
    };
  }

  async resolveDispute(id: string, resolution: string) {
    const dispute = await this.changeRequestModel.findById(id);
    if (!dispute) throw new NotFoundException('Dispute not found');

    dispute.status = ProfileChangeStatus.REJECTED;
    dispute.reason = resolution;
    dispute.processedAt = new Date();

    return dispute.save();
  }

  async approveDispute(id: string, resolution: string) {
    const dispute = await this.changeRequestModel.findById(id);
    if (!dispute) throw new NotFoundException('Dispute not found');

    dispute.status = ProfileChangeStatus.APPROVED;
    dispute.reason = resolution;
    dispute.processedAt = new Date();

    return dispute.save();
  }

  async getMyProfile(userId: string) {
    const me = await this.employeeModel.findById(userId).lean();
    if (!me) throw new NotFoundException('Profile not found');
    return me;
  }
}
