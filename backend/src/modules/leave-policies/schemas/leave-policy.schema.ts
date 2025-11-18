//src/modules/leave-policies/schemas/leave-policy.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LeavePolicyDocument = LeavePolicy & Document;

export enum PolicyType {
  ACCRUAL = 'ACCRUAL',
  APPROVAL = 'APPROVAL',
  VALIDATION = 'VALIDATION',
  CALCULATION = 'CALCULATION',
}

export enum AccrualFrequency {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  ANNUALLY = 'ANNUALLY',
}

export enum CriterionDate {
  HIRE_DATE = 'HIRE_DATE',
  WORK_START_DATE = 'WORK_START_DATE',
}

@Schema({ timestamps: true })
export class LeavePolicy {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, enum: PolicyType })
  policyType: PolicyType;

  // Accrual Rules
  @Prop({
    type: {
      frequency: { type: String, enum: AccrualFrequency },
      pauseDuringUnpaidLeave: { type: Boolean, default: true },
      pauseDuringSuspension: { type: Boolean, default: true },
      criterionDate: { type: String, enum: CriterionDate },
    },
  })
  accrualRules: {
    frequency: AccrualFrequency;
    pauseDuringUnpaidLeave: boolean;
    pauseDuringSuspension: boolean;
    criterionDate: CriterionDate;
  };

  // Approval Rules
  @Prop({
    type: {
      levels: [
        {
          sequence: { type: Number },
          role: { type: String },
          autoEscalateAfterHours: { type: Number },
          canDelegate: { type: Boolean },
        },
      ],
      managerCanOverride: { type: Boolean, default: false },
      hrCanOverride: { type: Boolean, default: true },
    },
  })
  approvalRules: {
    levels: {
      sequence: number;
      role: string;
      autoEscalateAfterHours: number;
      canDelegate: boolean;
    }[];
    managerCanOverride: boolean;
    hrCanOverride: boolean;
  };

  // Validation Rules
  @Prop({
    type: {
      minAdvanceNoticeDays: { type: Number, default: 0 },
      maxPostLeaveGracePeriodHours: { type: Number, default: 48 },
      blockOverlappingRequests: { type: Boolean, default: true },
      checkTeamAvailability: { type: Boolean, default: true },
      minTeamAvailabilityPercent: { type: Number, default: 70 },
    },
  })
  validationRules: {
    minAdvanceNoticeDays: number;
    maxPostLeaveGracePeriodHours: number;
    blockOverlappingRequests: boolean;
    checkTeamAvailability: boolean;
    minTeamAvailabilityPercent: number;
  };

  // Calculation Rules
  @Prop({
    type: {
      excludeWeekends: { type: Boolean, default: true },
      excludePublicHolidays: { type: Boolean, default: true },
      allowNegativeBalance: { type: Boolean, default: false },
      autoConvertToUnpaid: { type: Boolean, default: false },
    },
  })
  calculationRules: {
    excludeWeekends: boolean;
    excludePublicHolidays: boolean;
    allowNegativeBalance: boolean;
    autoConvertToUnpaid: boolean;
  };

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Date })
  effectiveFrom: Date;

  @Prop({ type: Date })
  effectiveTo: Date;

  @Prop({ type: String })
  description: string;
}

export const LeavePolicySchema = SchemaFactory.createForClass(LeavePolicy);