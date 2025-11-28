import {
  IsNumber,
  IsArray,
  IsBoolean,
  IsOptional,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateHolidayDto } from './create-holiday.dto';
import { CreateBlockedPeriodDto } from './create-blocked-period.dto';

export class CreateCalendarDto {
  @IsNumber()
  @Min(2020)
  @Max(2100)
  year: number;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateHolidayDto)
  holidays?: CreateHolidayDto[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateBlockedPeriodDto)
  blockedPeriods?: CreateBlockedPeriodDto[];

  @IsArray()
  @IsOptional()
  @IsNumber({}, { each: true }) // Instead of WeekDay enum, use numbers 0-6 (Mon-Sun)
  workingDays?: number[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
