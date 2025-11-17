import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LeaveTypeDocument = LeaveType & Document;

export enum LeaveCategory {
  PAID = 'PAID',
  UNPAID = 'UNPAID',
  DEDUCTIBLE = 'DEDUCTIBLE',
  NON_DEDUCTIBLE = 'NON_DEDUCTIBLE',
}

export enum Gender {
  ALL = 'ALL',
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

@Schema({ timestamps: true })
export class LeaveType {
  @Prop({ required: true, unique: true, trim: true })
  code: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, enum: LeaveCategory })
  category: LeaveCategory;

  @Prop({ default: false })
  requiresDocument: boolean;

  @Prop({ type: String })
  documentType: string;

  @Prop({ type: Number })
  maxDaysPerYear: number;

  @Prop({ type: Number })
  maxConsecutiveDays: number;

  @Prop({ type: Number, default: 0 })
  minDaysNotice: number;

  @Prop({ default: false })
  allowPartialDays: boolean;

  @Prop({ required: true, enum: Gender, default: Gender.ALL })
  gender: Gender;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ trim: true })
  payrollPayCode: string;

  @Prop({ type: String })
  description: string;
}

export const LeaveTypeSchema = SchemaFactory.createForClass(LeaveType);
