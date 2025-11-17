import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  EmployeeLeaveBalance,
  EmployeeLeaveBalanceSchema,
} from './schemas/employee-leave-balance.schema';
import { EmployeeLeaveBalanceController } from './employee-leave-balance.controller';
import { EmployeeLeaveBalanceService } from './employee-leave-balance.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EmployeeLeaveBalance.name, schema: EmployeeLeaveBalanceSchema },
    ]),
  ],
  controllers: [EmployeeLeaveBalanceController],
  providers: [EmployeeLeaveBalanceService],
  exports: [EmployeeLeaveBalanceService],
})
export class EmployeeLeaveBalanceModule {}

