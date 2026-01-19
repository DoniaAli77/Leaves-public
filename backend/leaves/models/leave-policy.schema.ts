import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { AccrualMethod } from '../enums/accrual-method.enum';
import { RoundingRule } from '../enums/rounding-rule.enum';

export type LeavePolicyDocument = HydratedDocument<LeavePolicy> & {
  createdAt: Date;
  updatedAt: Date;
};

@Schema({ timestamps: true })
export class LeavePolicy {
  @Prop({ type: Types.ObjectId, ref: 'LeaveType', required: true })
  leaveTypeId: Types.ObjectId;

  // ✅ Added (used in code + needed for expiry / active policies)
  @Prop({ default: true })
  isActive: boolean;

  // ✅ Added (used in your active-policy query and expiry logic)
  @Prop({ type: Date, default: null })
  effectiveFrom: Date | null;

  // ✅ Added (used in your active-policy query and expiry logic)
  @Prop({ type: Date, default: null })
  effectiveTo: Date | null;

  @Prop({ enum: AccrualMethod, default: AccrualMethod.MONTHLY })
  accrualMethod: AccrualMethod;

  @Prop({ default: 0 })
  monthlyRate: number;

  @Prop({ default: 0 })
  yearlyRate: number;

  @Prop({ default: false })
  carryForwardAllowed: boolean;

  @Prop({ default: 0 })
  maxCarryForward: number;

  // ✅ Keep as optional, but make default null for consistent DB behavior
  @Prop({ type: Number, default: null })
  expiryAfterMonths?: number | null;

  @Prop({ enum: RoundingRule, default: RoundingRule.NONE })
  roundingRule: RoundingRule;

  @Prop({ default: 0 })
  minNoticeDays: number;

  @Prop()
  maxConsecutiveDays?: number;

  @Prop({
    type: {
      minTenureMonths: Number,
      positionsAllowed: [String],
      contractTypesAllowed: [String],
    },
    default: {},
  })
  eligibility: Record<string, any>;
}

export const LeavePolicySchema = SchemaFactory.createForClass(LeavePolicy);
