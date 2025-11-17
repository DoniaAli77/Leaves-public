import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAdjustmentDto {
  @IsNotEmpty()
  @IsString()
  employeeId: string;

  @IsNotEmpty()
  @IsString()
  leaveTypeCode: string;

  @IsNotEmpty()
  @IsNumber()
  days: number; // positive = add, negative = subtract

  @IsOptional()
  @IsString()
  reason?: string;
}
