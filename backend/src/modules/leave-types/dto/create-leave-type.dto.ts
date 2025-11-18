import {
  IsString,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsOptional,
  Min,
  MaxLength,
} from 'class-validator';
import { LeaveCategory, Gender } from '../schemas/leave-type.schema';

export class CreateLeaveTypeDto {
  @IsString()
  @MaxLength(50, { message: 'Code must not exceed 50 characters' })
  code: string;

  @IsString()
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name: string;

  @IsEnum(LeaveCategory)
  category: LeaveCategory;

  @IsBoolean()
  @IsOptional()
  requiresDocument?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Document type must not exceed 100 characters' })
  documentType?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  maxDaysPerYear?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  maxConsecutiveDays?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  minDaysNotice?: number;

  @IsBoolean()
  @IsOptional()
  allowPartialDays?: boolean;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @MaxLength(50, { message: 'Payroll pay code must not exceed 50 characters' })
  @IsOptional()
  payrollPayCode?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  description?: string;
}
