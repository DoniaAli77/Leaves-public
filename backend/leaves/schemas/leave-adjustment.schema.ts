import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LeaveAdjustmentDocument = LeaveAdjustment & Document;

@Schema({ timestamps: true })
export class LeaveAdjustment {
  @Prop({ required: true })
  employeeId: string;

  @Prop({ required: true })
  leaveType: string;

  @Prop({ required: true })
  amount: number; // positive or negative

  @Prop()
  reason?: string;

  @Prop()
  hrAdminId?: string;

  @Prop({ type: Array, default: [] })
  auditTrail: any[];
}

export const LeaveAdjustmentSchema = SchemaFactory.createForClass(LeaveAdjustment);
