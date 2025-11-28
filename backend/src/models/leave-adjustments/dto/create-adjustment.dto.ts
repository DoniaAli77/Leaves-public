import { IsNotEmpty, IsNumber, IsString, IsEnum } from 'class-validator';
import { AdjustmentType } from '../../../enums/adjustment-type.enum';

export class CreateAdjustmentDto {
  @IsNotEmpty()
  @IsString()
  employeeId: string;

  @IsNotEmpty()
  @IsString()
  leaveTypeId: string;

  @IsNotEmpty()
  @IsEnum(AdjustmentType)
  adjustmentType: AdjustmentType;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  reason: string;

  @IsNotEmpty()
  @IsString()
  hrUserId: string;
}
