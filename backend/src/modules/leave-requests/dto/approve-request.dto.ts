import { IsOptional, IsNotEmpty, IsString } from 'class-validator';

export class ApproveRequestDto {
  @IsNotEmpty()
  @IsString()
  approverId: string; // managerId or hrAdminId

  @IsOptional()
  @IsString()
  comment?: string;
}
