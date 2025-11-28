import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeaveEntitlement, LeaveEntitlementSchema } from './schemas/leave-entitlement.schema';
import { LeaveEntitlementsController } from './leave-entitlements.controller';
import { LeaveEntitlementsService } from './leave-entitlements.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LeaveEntitlement.name, schema: LeaveEntitlementSchema },
    ]),
  ],
  controllers: [LeaveEntitlementsController],
  providers: [LeaveEntitlementsService],
  exports: [LeaveEntitlementsService],
})
export class LeaveEntitlementsModule {}