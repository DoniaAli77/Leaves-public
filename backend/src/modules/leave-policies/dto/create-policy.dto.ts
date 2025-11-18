//src/modules/leave-policies/dto/create-policy.dto.ts

import {
  IsString,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsDate,
  ValidateNested,
  IsArray,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  PolicyType,
  AccrualFrequency,
  CriterionDate,
} from '../schemas/leave-policy.schema';

class AccrualRulesDto {
  @IsEnum(AccrualFrequency)
  frequency: AccrualFrequency;

  @IsBoolean()
  @IsOptional()
  pauseDuringUnpaidLeave?: boolean;

  @IsBoolean()
  @IsOptional()
  pauseDuringSuspension?: boolean;

  @IsEnum(CriterionDate)
  criterionDate: CriterionDate;
}

class ApprovalLevelDto {
  @IsNumber()
  @Min(1)
  sequence: number;

  @IsString()
  role: string;

  @IsNumber()
  @Min(0)
  autoEscalateAfterHours: number;

  @IsBoolean()
  canDelegate: boolean;
}

class ApprovalRulesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApprovalLevelDto)
  levels: ApprovalLevelDto[];

  @IsBoolean()
  @IsOptional()
  managerCanOverride?: boolean;

  @IsBoolean()
  @IsOptional()
  hrCanOverride?: boolean;
}

class ValidationRulesDto {
  @IsNumber()
  @Min(0)
  minAdvanceNoticeDays: number;

  @IsNumber()
  @Min(0)
  maxPostLeaveGracePeriodHours: number;

  @IsBoolean()
  blockOverlappingRequests: boolean;

  @IsBoolean()
  checkTeamAvailability: boolean;

  @IsNumber()
  @Min(0)
  @Max(100)
  minTeamAvailabilityPercent: number;
}

class CalculationRulesDto {
  @IsBoolean()
  excludeWeekends: boolean;

  @IsBoolean()
  excludePublicHolidays: boolean;

  @IsBoolean()
  allowNegativeBalance: boolean;

  @IsBoolean()
  autoConvertToUnpaid: boolean;
}

export class CreatePolicyDto {
  @IsString()
  name: string;

  @IsEnum(PolicyType)
  policyType: PolicyType;

  @ValidateNested()
  @Type(() => AccrualRulesDto)
  @IsOptional()
  accrualRules?: AccrualRulesDto;

  @ValidateNested()
  @Type(() => ApprovalRulesDto)
  @IsOptional()
  approvalRules?: ApprovalRulesDto;

  @ValidateNested()
  @Type(() => ValidationRulesDto)
  @IsOptional()
  validationRules?: ValidationRulesDto;

  @ValidateNested()
  @Type(() => CalculationRulesDto)
  @IsOptional()
  calculationRules?: CalculationRulesDto;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  effectiveFrom?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  effectiveTo?: Date;

  @IsString()
  @IsOptional()
  description?: string;
}