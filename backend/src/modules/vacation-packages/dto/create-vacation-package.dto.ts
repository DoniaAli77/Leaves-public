import {
  IsString,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsOptional,
  Min,
  MaxLength,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ContractType,
  AccrualFrequency,
} from '../schemas/vacation-package.schema';

class CustomEntitlementDto {
  @IsString()
  leaveTypeId: string;

  @IsNumber()
  @Min(0)
  days: number;
}

export class CreateVacationPackageDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @MaxLength(50)
  code: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  grade?: string;

  @IsEnum(ContractType)
  contractType: ContractType;

  @IsNumber()
  @Min(0)
  annualLeaveDays: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  sickLeaveDays?: number;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CustomEntitlementDto)
  customEntitlements?: CustomEntitlementDto[];

  @IsEnum(AccrualFrequency)
  accrualFrequency: AccrualFrequency;

  @IsBoolean()
  @IsOptional()
  carryOverEnabled?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  maxCarryOverDays?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}