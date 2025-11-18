import { IsString, IsDate, IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { HolidayType } from '../schemas/organization-calendar.schema';

export class CreateHolidayDto {
  @IsDate()
  @Type(() => Date)
  date: Date;

  @IsString()
  name: string;

  @IsEnum(HolidayType)
  type: HolidayType;

  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;
}