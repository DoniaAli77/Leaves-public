import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  OrganizationCalendar,
  OrganizationCalendarDocument,
  WeekDay,
} from './schemas/organization-calendar.schema';
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { UpdateCalendarDto } from './dto/update-calendar.dto';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { CreateBlockedPeriodDto } from './dto/create-blocked-period.dto';

@Injectable()
export class OrganizationCalendarService {
  constructor(
    @InjectModel(OrganizationCalendar.name)
    private calendarModel: Model<OrganizationCalendarDocument>,
  ) {}

  async create(createCalendarDto: CreateCalendarDto): Promise<OrganizationCalendar> {
    const existingCalendar = await this.calendarModel.findOne({
      year: createCalendarDto.year,
    });

    if (existingCalendar) {
      throw new ConflictException(
        `Calendar for year ${createCalendarDto.year} already exists`,
      );
    }

    const createdCalendar = new this.calendarModel(createCalendarDto);
    return createdCalendar.save();
  }

  async findAll(): Promise<OrganizationCalendar[]> {
    return this.calendarModel.find().exec();
  }

  async findByYear(year: number): Promise<OrganizationCalendar> {
    const calendar = await this.calendarModel.findOne({ year }).exec();

    if (!calendar) {
      throw new NotFoundException(`Calendar for year ${year} not found`);
    }

    return calendar;
  }

  async findActive(): Promise<OrganizationCalendar[]> {
    return this.calendarModel.find({ isActive: true }).exec();
  }

  async update(
    year: number,
    updateCalendarDto: UpdateCalendarDto,
  ): Promise<OrganizationCalendar> {
    const updatedCalendar = await this.calendarModel
      .findOneAndUpdate({ year }, updateCalendarDto, { new: true })
      .exec();

    if (!updatedCalendar) {
      throw new NotFoundException(`Calendar for year ${year} not found`);
    }

    return updatedCalendar;
  }

  async addHoliday(
    year: number,
    createHolidayDto: CreateHolidayDto,
  ): Promise<OrganizationCalendar> {
    const calendar = await this.calendarModel.findOne({ year }).exec();

    if (!calendar) {
      throw new NotFoundException(`Calendar for year ${year} not found`);
    }

    calendar.holidays.push(createHolidayDto as any);
    return calendar.save();
  }

  async removeHoliday(year: number, holidayDate: Date): Promise<OrganizationCalendar> {
    const calendar = await this.calendarModel.findOne({ year }).exec();

    if (!calendar) {
      throw new NotFoundException(`Calendar for year ${year} not found`);
    }

    calendar.holidays = calendar.holidays.filter(
      (holiday) => holiday.date.toISOString() !== new Date(holidayDate).toISOString(),
    );

    return calendar.save();
  }

  async addBlockedPeriod(
    year: number,
    createBlockedPeriodDto: CreateBlockedPeriodDto,
  ): Promise<OrganizationCalendar> {
    const calendar = await this.calendarModel.findOne({ year }).exec();

    if (!calendar) {
      throw new NotFoundException(`Calendar for year ${year} not found`);
    }

    if (
      new Date(createBlockedPeriodDto.startDate) >
      new Date(createBlockedPeriodDto.endDate)
    ) {
      throw new BadRequestException('Start date must be before end date');
    }

    calendar.blockedPeriods.push(createBlockedPeriodDto as any);
    return calendar.save();
  }

  async removeBlockedPeriod(year: number, index: number): Promise<OrganizationCalendar> {
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

  async calculateWorkingDays(
    year: number,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const calendar = await this.findByYear(year);

    let workingDaysCount = 0;
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayName = this.getDayName(currentDate);

      const isWorkingDay = calendar.workingDays.includes(dayName as WeekDay);
      const isHoliday = calendar.holidays.some(
        (holiday) =>
          holiday.date.toDateString() === currentDate.toDateString(),
      );

      if (isWorkingDay && !isHoliday) {
        workingDaysCount++;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return workingDaysCount;
  }

  async isBlockedPeriod(year: number, date: Date): Promise<boolean> {
    const calendar = await this.findByYear(year);
    const checkDate = new Date(date);

    return calendar.blockedPeriods.some(
      (period) =>
        checkDate >= new Date(period.startDate) &&
        checkDate <= new Date(period.endDate),
    );
  }

  async remove(year: number): Promise<void> {
    const result = await this.calendarModel.findOneAndDelete({ year }).exec();

    if (!result) {
      throw new NotFoundException(`Calendar for year ${year} not found`);
    }
  }

  private getDayName(date: Date): string {
    const days = [
      'SUNDAY',
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
    ];
    return days[date.getDay()];
  }
}