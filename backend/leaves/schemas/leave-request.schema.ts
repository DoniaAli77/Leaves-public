import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LeaveRequestDocument = LeaveRequest & Document;

@Schema({ timestamps: true })
export class LeaveRequest {
  @Prop({ type: String, required: true })
  employeeId: string;

  @Prop({ type: String, required: true })
  leaveType: string; // e.g. ANNUAL, SICK

  @Prop({ type: Date, required: true })
  startDate: Date;

  @Prop({ type: Date, required: true })
  endDate: Date;

  @Prop()
  justification?: string;

  @Prop()
  documentUrl?: string;

  @Prop({ default: 'pending' })
  status: string;

  @Prop()
  managerId?: string;

  @Prop()
  hrAdminId?: string;

  @Prop({ type: Array, default: [] })
  auditTrail: any[];
}

export const LeaveRequestSchema = SchemaFactory.createForClass(LeaveRequest);
