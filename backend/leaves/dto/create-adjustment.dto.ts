import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateAdjustmentDto {
  @IsString()
  employeeId: string;

  @IsString()
  leaveType: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsString()
  hrAdminId: string;
}
