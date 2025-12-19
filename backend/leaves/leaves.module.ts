import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';

import { LeaveType, LeaveTypeSchema } from './models/leave-type.schema';
import { LeaveCategory, LeaveCategorySchema } from './models/leave-category.schema';
import { LeavePolicy, LeavePolicySchema } from './models/leave-policy.schema';
import { LeaveRequest, LeaveRequestSchema } from './models/leave-request.schema';
import { Attachment, AttachmentSchema } from './models/attachment.schema';
import { LeaveEntitlement, LeaveEntitlementSchema } from './models/leave-entitlement.schema';
import { LeaveAdjustment, LeaveAdjustmentSchema } from './models/leave-adjustment.schema';
import { Calendar, CalendarSchema } from './models/calendar.schema';

import { EmployeeProfileModule } from '../employee-profile/employee-profile.module';
import { TimeManagementModule } from '../time-management/time-management.module';

import { LeavesService } from './leaves.service';
import { LeavesController } from './leaves.controller';

@Module({
  imports: [
    // ✅ PROVIDE JwtService LOCALLY (NO AUTH MODULE CHANGE)
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'SUPER_SECRET_KEY_CHANGE_THIS',
      signOptions: { expiresIn: '2h' },
    }),

    MongooseModule.forFeature([
      { name: LeaveType.name, schema: LeaveTypeSchema },
      { name: LeaveCategory.name, schema: LeaveCategorySchema },
      { name: LeavePolicy.name, schema: LeavePolicySchema },
      { name: LeaveRequest.name, schema: LeaveRequestSchema },
      { name: Attachment.name, schema: AttachmentSchema },
      { name: LeaveEntitlement.name, schema: LeaveEntitlementSchema },
      { name: LeaveAdjustment.name, schema: LeaveAdjustmentSchema },
      { name: Calendar.name, schema: CalendarSchema },
    ]),

    EmployeeProfileModule,
    TimeManagementModule,
  ],
  controllers: [LeavesController],
  providers: [LeavesService],
})
export class LeavesModule {}
