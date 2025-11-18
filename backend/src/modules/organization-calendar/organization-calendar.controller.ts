import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { OrganizationCalendarService } from './organization-calendar.service';
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { UpdateCalendarDto } from './dto/update-calendar.dto';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { CreateBlockedPeriodDto } from './dto/create-blocked-period.dto';

@Controller('organization-calendar')
export class OrganizationCalendarController {
  constructor(
    private readonly calendarService: OrganizationCalendarService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCalendarDto: CreateCalendarDto) {
    return this.calendarService.create(createCalendarDto);
  }

  @Get()
  findAll() {
    return this.calendarService.findAll();
  }

  @Get('active')
  findActive() {
    return this.calendarService.findActive();
  }

  @Get('year/:year')
  findByYear(@Param('year') year: number) {
    return this.calendarService.findByYear(year);
  }

  @Patch('year/:year')
  update(@Param('year') year: number, @Body() updateCalendarDto: UpdateCalendarDto) {
    return this.calendarService.update(year, updateCalendarDto);
  }

  @Post('year/:year/holidays')
  addHoliday(@Param('year') year: number, @Body() createHolidayDto: CreateHolidayDto) {
    return this.calendarService.addHoliday(year, createHolidayDto);
  }

  @Delete('year/:year/holidays')
  removeHoliday(@Param('year') year: number, @Query('date') date: string) {
    return this.calendarService.removeHoliday(year, new Date(date));
  }

  @Post('year/:year/blocked-periods')
  addBlockedPeriod(
    @Param('year') year: number,
    @Body() createBlockedPeriodDto: CreateBlockedPeriodDto,
  ) {
    return this.calendarService.addBlockedPeriod(year, createBlockedPeriodDto);
  }

  @Delete('year/:year/blocked-periods/:index')
  removeBlockedPeriod(@Param('year') year: number, @Param('index') index: number) {
    return this.calendarService.removeBlockedPeriod(year, index);
  }

  @Get('year/:year/working-days')
  calculateWorkingDays(
    @Param('year') year: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.calendarService.calculateWorkingDays(
      year,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('year/:year/is-blocked')
  isBlockedPeriod(@Param('year') year: number, @Query('date') date: string) {
    return this.calendarService.isBlockedPeriod(year, new Date(date));
  }

  @Delete('year/:year')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('year') year: number) {
    return this.calendarService.remove(year);
  }
}