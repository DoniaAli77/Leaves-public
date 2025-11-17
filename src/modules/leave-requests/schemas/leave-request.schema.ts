import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LeaveRequestDocument = LeaveRequest & Document;

@Schema({ timestamps: true })
export class LeaveRequest {
  @Prop({ type: Types.ObjectId, required: true })
  employeeId: Types.ObjectId;

  @Prop({ required: true })
  leaveTypeCode: string; // e.g. ANNUAL, SICK

  @Prop({ type: Date, required: true })
  startDate: Date;

  @Prop({ type: Date, required: true })
  endDate: Date;

  @Prop()
  justification?: string;

  @Prop()
  documentUrl?: string;

  @Prop({ default: 'pending' })
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';

  @Prop()
  managerId?: Types.ObjectId;

  @Prop()
  hrAdminId?: Types.ObjectId;

  @Prop({ default: [] })
  auditTrail: Array<any>;
}

export const LeaveRequestSchema = SchemaFactory.createForClass(LeaveRequest);
