import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LeaveRequest, LeaveRequestDocument } from '../schemas/leave-request.schema';
import { LeaveBalancesService } from './leave-balances.service';
const { REQUEST_STATUS } = require('../../common/constants');

@Injectable()
export class LeaveRequestsService {
  private readonly logger = new Logger(LeaveRequestsService.name);

  constructor(
    @InjectModel(LeaveRequest.name) private leaveRequestModel: Model<LeaveRequestDocument>,
    private leaveBalancesService: LeaveBalancesService,
  ) {}

  async submitRequest(payload: {
    employeeId: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    justification?: string;
    documentUrl?: string;
  }) {
    // basic validations
    const { employeeId, startDate, endDate, leaveType } = payload;
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (s > e) throw new BadRequestException('startDate must be before or equal endDate');

    // compute days (simple day count, you can refine for working days)
    const msPerDay = 24 * 60 * 60 * 1000;
    const days = Math.round((e.getTime() - s.getTime()) / msPerDay) + 1;

    // check overlap with existing approved or pending leaves
    const overlap = await this.leaveRequestModel.findOne({
    employeeId,
    status: {
        $in: [
        REQUEST_STATUS.PENDING,
        REQUEST_STATUS.MANAGER_APPROVED,
        REQUEST_STATUS.HR_APPROVED,
        REQUEST_STATUS.APPROVED
        ]
    },
    startDate: { $lte: e },
    endDate: { $gte: s }
    }).lean();


    if (overlap) {
      throw new BadRequestException('Requested dates overlap with an existing leave');
    }

    // check balance (simple check)
    const balanceDoc = await this.leaveBalancesService.getBalance(employeeId);
    const available = (balanceDoc.balances || {})[leaveType] || 0;
    // we allow requesting even if available < days; we'll mark pending and later either convert or reject
    // add pending amount now
    await this.leaveBalancesService.addPending(employeeId, leaveType, days);

    const request = await this.leaveRequestModel.create({
      ...payload,
      startDate: s,
      endDate: e,
      status: REQUEST_STATUS.PENDING,
      auditTrail: [{ action: 'created', at: new Date(), by: employeeId }]
    });

    return { request, days, available };
  }

  async managerDecision(id: string, approverId: string, approve: boolean, comment?: string) {
    const r = await this.leaveRequestModel.findById(id);
    if (!r) throw new BadRequestException('Request not found');
    if (r.status !== REQUEST_STATUS.PENDING) {
      throw new BadRequestException(`Cannot manager decision on request with status ${r.status}`);
    }
    r.auditTrail.push({ action: approve ? 'manager_approved' : 'manager_rejected', at: new Date(), by: approverId, comment });
    r.managerId = approverId;
    r.status = approve ? REQUEST_STATUS.MANAGER_APPROVED : REQUEST_STATUS.MANAGER_REJECTED;
    await r.save();
    return r;
  }

  async hrDecision(id: string, approverId: string, approve: boolean, comment?: string) {
    const r = await this.leaveRequestModel.findById(id);
    if (!r) throw new BadRequestException('Request not found');
    if (r.status !== REQUEST_STATUS.MANAGER_APPROVED) {
      throw new BadRequestException(`Cannot HR decision on request with status ${r.status}`);
    }
    r.auditTrail.push({ action: approve ? 'hr_approved' : 'hr_rejected', at: new Date(), by: approverId, comment });
    r.hrAdminId = approverId;
    r.status = approve ? REQUEST_STATUS.HR_APPROVED : REQUEST_STATUS.HR_REJECTED;

    // if approved, apply to balance and notify time/payroll stubs
    if (approve) {
      // compute days
      const msPerDay = 24 * 60 * 60 * 1000;
      const days = Math.round((r.endDate.getTime() - r.startDate.getTime()) / msPerDay) + 1;
      // If available < days => either convert to unpaid left to HR rules. For simplicity:
      const balanceDoc = await this.leaveBalancesService.getBalance(r.employeeId);
      const available = (balanceDoc.balances || {})[r.leaveType] || 0;
      if (available >= days) {
        // reduce balance
        await this.leaveBalancesService.applyApproved(r.employeeId, r.leaveType, days);
      } else {
        // reduce whatever available to zero and leave remainder as unpaid (integration with payroll needed)
        await this.leaveBalancesService.applyApproved(r.employeeId, r.leaveType, Math.min(available, days));
        // we could call payroll stub with unpaid days here
      }
    }
    await r.save();
    return r;
  }

  async cancelRequest(id: string, actorId: string) {
    const r = await this.leaveRequestModel.findById(id);
    if (!r) throw new BadRequestException('Request not found');
    if ([REQUEST_STATUS.APPROVED, REQUEST_STATUS.HR_APPROVED].includes(r.status)) {
      throw new BadRequestException('Approved leaves cannot be cancelled via this endpoint');
    }
    r.status = REQUEST_STATUS.CANCELLED;
    r.auditTrail.push({ action: 'cancelled', at: new Date(), by: actorId });
    // rollback pending
    const msPerDay = 24 * 60 * 60 * 1000;
    const days = Math.round((r.endDate.getTime() - r.startDate.getTime()) / msPerDay) + 1;
    // reduce pending
    const bal = await this.leaveBalancesService.getBalance(r.employeeId);
    const pending = { ...(bal.pending || {}) };
    pending[r.leaveType] = Math.max(0, (pending[r.leaveType] || 0) - days);
    await this.leaveBalancesService.createOrUpdateBalance(r.employeeId, r.leaveType, (bal.balances || {})[r.leaveType] || 0);
    bal.pending = pending;
    await bal.save();
    await r.save();
    return r;
  }

  async listByEmployee(employeeId: string) {
    return this.leaveRequestModel.find({ employeeId }).sort({ createdAt: -1 }).lean();
  }
}
