//src/modules/leave-policies/leave-policies.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeavePoliciesService } from './leave-policies.service';
import { LeavePoliciesController } from './leave-policies.controller';
import { LeavePolicy, LeavePolicySchema } from './schemas/leave-policy.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LeavePolicy.name, schema: LeavePolicySchema },
    ]),
  ],
  controllers: [LeavePoliciesController],
  providers: [LeavePoliciesService],
  exports: [LeavePoliciesService],
})
export class LeavePoliciesModule {}