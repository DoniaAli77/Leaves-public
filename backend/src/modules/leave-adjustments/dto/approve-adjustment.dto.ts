import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class ApproveAdjustmentDto {
  @IsNotEmpty()
  @IsString()
  approverId: string;

  @IsOptional()
  @IsString()
  comment?: string;
}
