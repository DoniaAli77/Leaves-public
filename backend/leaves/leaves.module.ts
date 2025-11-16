import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeaveRequest, LeaveRequestSchema } from './schemas/leave-request.schema';
import { LeaveBalance, LeaveBalanceSchema } from './schemas/leave-balance.schema';
import { LeaveAdjustment, LeaveAdjustmentSchema } from './schemas/leave-adjustment.schema';
//uncomment after doing controllers//import { LeaveRequestsController } from './controllers/leave-requests.controller';
//uncomment after doing controllers//import { LeaveBalancesController } from './controllers/leave-balances.controller';
//uncomment after doing controllers//import { LeaveAdjustmentsController } from './controllers/leave-adjustments.controller';
import { LeaveRequestsService } from './services/leave-requests.service';
import { LeaveBalancesService } from './services/leave-balances.service';
import { LeaveAdjustmentsService } from './services/leave-adjustments.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LeaveRequest.name, schema: LeaveRequestSchema },
      { name: LeaveBalance.name, schema: LeaveBalanceSchema },
      { name: LeaveAdjustment.name, schema: LeaveAdjustmentSchema },
    ]),
  ],
//uncomment after doing controllers//controllers: [LeaveRequestsController, LeaveBalancesController, LeaveAdjustmentsController],
  providers: [LeaveRequestsService, LeaveBalancesService, LeaveAdjustmentsService],
})
export class LeavesModule {}
