import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeaveAdjustmentsController } from './leave-adjustments.controller';
import { LeaveAdjustmentsService } from './leave-adjustments.service';
import { LeaveAdjustment, LeaveAdjustmentSchema } from './schemas/leave-adjustment.schema';
import { EmployeeLeaveBalanceModule } from '../employee-leave-balance/employee-leave-balance.module';
import { EmployeeLeaveBalanceService } from '../employee-leave-balance/employee-leave-balance.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: LeaveAdjustment.name, schema: LeaveAdjustmentSchema }]),
    forwardRef(() => EmployeeLeaveBalanceModule),
  ],
  controllers: [LeaveAdjustmentsController],
  providers: [
    {
      provide: LeaveAdjustmentsService,
      useFactory: (balService: EmployeeLeaveBalanceService, model) => {
        // Nest will inject model automatically via constructor normally,
        // but we keep default provider by listing the class below as well.
        return new LeaveAdjustmentsService(model, balService);
      },
      inject: [EmployeeLeaveBalanceService],
    },
    LeaveAdjustmentsService,
  ],
  exports: [LeaveAdjustmentsService],
})
export class LeaveAdjustmentsModule {}
