import {
  IsString,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsOptional,
  Min,
  ValidateNested,
  IsArray,
  IsNotEmpty,
} from 'class-validator';

import { Type } from 'class-transformer';
import { AccrualMethod } from '../../../enums/accrual-method.enum';
import { RoundingRule } from '../../../enums/rounding-rule.enum';


class EligibilityDto {
  @IsNumber()
  @Min(0)
  minTenureMonths: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  positionsAllowed?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  contractTypesAllowed?: string[];
}

export class CreatePolicyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  leaveTypeId: string;

  @IsEnum(AccrualMethod)
  @IsOptional()
  accrualMethod?: AccrualMethod;

  @IsNumber()
  @Min(0)
  @IsOptional()
  monthlyRate?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  yearlyRate?: number;

  @IsBoolean()
  @IsOptional()
  carryForwardAllowed?: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  maxCarryForward?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  expiryAfterMonths?: number;

  @IsEnum(RoundingRule)
  @IsOptional()
  roundingRule?: RoundingRule;

  @IsNumber()
  @Min(0)
  @IsOptional()
  minNoticeDays?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  maxConsecutiveDays?: number;

  @ValidateNested()
  @Type(() => EligibilityDto)
  @IsOptional()
  eligibility?: EligibilityDto;
}
