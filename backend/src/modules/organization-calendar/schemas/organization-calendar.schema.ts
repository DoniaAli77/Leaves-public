import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrganizationCalendarDocument = OrganizationCalendar & Document;

export enum HolidayType {
  NATIONAL = 'NATIONAL',
  COMPANY = 'COMPANY',
  RELIGIOUS = 'RELIGIOUS',
}

export enum WeekDay {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

@Schema({ timestamps: true })
export class OrganizationCalendar {
  @Prop({ required: true, unique: true })
  year: number;

  @Prop({
    type: [
      {
        date: { type: Date, required: true },
        name: { type: String, required: true },
        type: { type: String, enum: HolidayType, required: true },
        isRecurring: { type: Boolean, default: false },
      },
    ],
    default: [],
  })
  holidays: {
    date: Date;
    name: string;
    type: HolidayType;
    isRecurring: boolean;
  }[];

  @Prop({
    type: [
      {
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        reason: { type: String, required: true },
        affectedDepartments: [{ type: Types.ObjectId, ref: 'Department' }],
        exceptions: [{ type: Types.ObjectId, ref: 'Employee' }],
      },
    ],
    default: [],
  })
  blockedPeriods: {
    startDate: Date;
    endDate: Date;
    reason: string;
    affectedDepartments: Types.ObjectId[];
    exceptions: Types.ObjectId[];
  }[];

  @Prop({
    type: [String],
    enum: WeekDay,
    default: [
      WeekDay.MONDAY,
      WeekDay.TUESDAY,
      WeekDay.WEDNESDAY,
      WeekDay.THURSDAY,
      WeekDay.FRIDAY,
    ],
  })
  workingDays: WeekDay[];

  @Prop({ default: true })
  isActive: boolean;
}

export const OrganizationCalendarSchema = SchemaFactory.createForClass(
  OrganizationCalendar,
);