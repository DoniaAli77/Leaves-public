import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VacationPackageDocument = VacationPackage & Document;

export enum ContractType {
  PERMANENT = 'PERMANENT',
  CONTRACT = 'CONTRACT',
  PART_TIME = 'PART_TIME',
}

export enum AccrualFrequency {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  ANNUALLY = 'ANNUALLY',
}

@Schema({ timestamps: true })
export class VacationPackage {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, trim: true })
  code: string;

  @Prop({ trim: true })
  grade: string;

  @Prop({ required: true, enum: ContractType })
  contractType: ContractType;

  @Prop({ required: true, type: Number, min: 0 })
  annualLeaveDays: number;

  @Prop({ type: Number, min: 0, default: 0 })
  sickLeaveDays: number;

  @Prop({
    type: [
      {
        leaveTypeId: { type: Types.ObjectId, ref: 'LeaveType' },
        days: { type: Number, min: 0 },
      },
    ],
    default: [],
  })
  customEntitlements: {
    leaveTypeId: Types.ObjectId;
    days: number;
  }[];

  @Prop({ required: true, enum: AccrualFrequency })
  accrualFrequency: AccrualFrequency;

  @Prop({ default: true })
  carryOverEnabled: boolean;

  @Prop({ type: Number, min: 0, default: 0 })
  maxCarryOverDays: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: String })
  description: string;
}

export const VacationPackageSchema =
  SchemaFactory.createForClass(VacationPackage);