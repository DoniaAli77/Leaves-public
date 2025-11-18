import {
  IsNumber,
  IsArray,
  IsEnum,
  IsBoolean,
  IsOptional,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { WeekDay } from '../schemas/organization-calendar.schema';
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
  @IsEnum(WeekDay, { each: true })
  @IsOptional()
  workingDays?: WeekDay[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}