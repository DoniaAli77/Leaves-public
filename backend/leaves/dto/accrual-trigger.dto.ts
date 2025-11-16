import { IsString, IsOptional } from 'class-validator';

export class AccrualTriggerDto {
  @IsOptional()
  employeeId?: string; // if omitted, accrual applied for all employees
}
