import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LeaveAdjustmentDocument = LeaveAdjustment & Document;

@Schema({ timestamps: true })
export class LeaveAdjustment {
  @Prop({ type: Types.ObjectId, required: true })
  employeeId: Types.ObjectId;

  @Prop({ required: true })
  leaveTypeCode: string;

  @Prop({ required: true })
  days: number; // positive or negative

  @Prop()
  reason?: string;

  @Prop({ default: 'pending' })
  status: 'pending' | 'approved' | 'rejected';

  @Prop()
  approverId?: Types.ObjectId;

  @Prop({ default: [] })
  auditTrail: Array<any>;
}

export const LeaveAdjustmentSchema = SchemaFactory.createForClass(LeaveAdjustment);
