import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeaveAdjustmentsController } from './leave-adjustments.controller';
import { LeaveAdjustmentsService } from './leave-adjustments.service';
import { LeaveAdjustment, LeaveAdjustmentSchema } from './schemas/leave-adjustment.schema';
import { LeaveEntitlementsModule } from '../leave-entitlements/leave-entitlements.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LeaveAdjustment.name, schema: LeaveAdjustmentSchema }
    ]),
    // We import the Entitlements module because Adjustments need to update balances
    forwardRef(() => LeaveEntitlementsModule),
  ],
  controllers: [LeaveAdjustmentsController],
  providers: [LeaveAdjustmentsService],
  exports: [LeaveAdjustmentsService],
})
export class LeaveAdjustmentsModule {}