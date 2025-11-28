import { IsString, IsDate, IsArray, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBlockedPeriodDto {
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @IsString()
  reason: string;

  @IsArray()
  @IsOptional()
  affectedDepartments?: string[];

  @IsArray()
  @IsOptional()
  exceptions?: string[];
}
