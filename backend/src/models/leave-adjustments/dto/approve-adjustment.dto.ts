import { IsNotEmpty, IsString } from 'class-validator';

export class ApproveAdjustmentDto {
  @IsNotEmpty()
  @IsString()
  approverId: string;
}
