import { IsString, IsDate, IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateHolidayDto {
  @IsDate()
  @Type(() => Date)
  date: Date;

  @IsString()
  name: string;

  @IsString()
  type: string; // Instead of HolidayType enum

  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;
}
