import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Calendar, CalendarDocument } from './schemas/calendar.schema';
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { UpdateCalendarDto } from './dto/update-calendar.dto';
import { CreateBlockedPeriodDto } from './dto/create-blocked-period.dto';

@Injectable()
export class OrganizationCalendarService {
  constructor(

    @InjectModel(Calendar.name)
    private calendarModel: Model<CalendarDocument>,
  ) {}

  async create(createDto: CreateCalendarDto): Promise<Calendar> {
    const existing = await this.calendarModel.findOne({
      year: createDto.year,
    });

    if (existing) {
      throw new ConflictException(`Calendar for year ${createDto.year} already exists`);
    }

    const created = new this.calendarModel(createDto);
    return created.save();
  }

  async findAll(): Promise<Calendar[]> {
    return this.calendarModel.find().exec();
  }

  async findByYear(year: number): Promise<Calendar> {
    const calendar = await this.calendarModel.findOne({ year }).exec();
    if (!calendar) {
      throw new NotFoundException(`Calendar for year ${year} not found`);
    }
    return calendar;
  }

  async update(year: number, updateDto: UpdateCalendarDto): Promise<Calendar> {
    const updated = await this.calendarModel
      .findOneAndUpdate({ year }, updateDto, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException(`Calendar for year ${year} not found`);
    }
    return updated;
  }

  async remove(year: number): Promise<void> {
    const result = await this.calendarModel.findOneAndDelete({ year }).exec();
    if (!result) {
      throw new NotFoundException(`Calendar for year ${year} not found`);
    }
  }


  async addBlockedPeriod(year: number, dto: CreateBlockedPeriodDto): Promise<Calendar> {
    const calendar = await this.calendarModel.findOne({ year }).exec();
    if (!calendar) {
      throw new NotFoundException(`Calendar for year ${year} not found`);
    }

    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);

    if (start > end) {
      throw new BadRequestException('Start date must be before end date');
    }

    // Map DTO (startDate/endDate) to Schema (from/to)
    calendar.blockedPeriods.push({
      from: start,
      to: end,
      reason: dto.reason,
    });

    return calendar.save();
  }

  async removeBlockedPeriod(year: number, index: number): Promise<Calendar> {
    const calendar = await this.calendarModel.findOne({ year }).exec();
    if (!calendar) {
      throw new NotFoundException(`Calendar for year ${year} not found`);
    }

    if (index < 0 || index >= calendar.blockedPeriods.length) {
      throw new BadRequestException('Invalid blocked period index');
    }

    calendar.blockedPeriods.splice(index, 1);
    return calendar.save();
  }

  async isBlockedPeriod(year: number, date: Date): Promise<boolean> {
    const calendar = await this.findByYear(year);
    const checkDate = new Date(date);

    return calendar.blockedPeriods.some(
      (period) =>
        checkDate >= new Date(period.from) && 
        checkDate <= new Date(period.to),
    );
  }


  async addHolidayRef(year: number, holidayId: string): Promise<Calendar> {
    const calendar = await this.calendarModel.findOne({ year }).exec();
    if (!calendar) throw new NotFoundException(`Calendar for ${year} not found`);

    calendar.holidays.push(new Types.ObjectId(holidayId));
    return calendar.save();
  }
}