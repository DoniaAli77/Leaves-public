import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LeaveBalanceDocument = LeaveBalance & Document;

@Schema({ timestamps: true })
export class LeaveBalance {
  @Prop({ required: true, unique: true })
  employeeId: string;

  // map of leaveType => numbers
  @Prop({ type: Object, default: {} })
  balances: Record<string, number>;

  @Prop({ type: Object, default: {} })
  pending: Record<string, number>;

  @Prop({ type: Object, default: {} })
  accrued: Record<string, number>;

  @Prop({ type: Object, default: {} })
  carryover: Record<string, number>;

  @Prop()
  lastAccrualDate?: Date;
}

export const LeaveBalanceSchema = SchemaFactory.createForClass(LeaveBalance);
