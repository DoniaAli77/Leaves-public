import { IsString, IsOptional } from 'class-validator';

export class DecisionDto {
  @IsString()
  approverId: string;

  @IsOptional()
  @IsString()
  comment?: string;
}
