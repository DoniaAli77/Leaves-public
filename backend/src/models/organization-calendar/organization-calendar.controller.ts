import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { OrganizationCalendarService } from './organization-calendar.service';
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { UpdateCalendarDto } from './dto/update-calendar.dto';
import { CreateBlockedPeriodDto } from './dto/create-blocked-period.dto';
// FIX: Import the correct class name
import { Calendar } from './schemas/calendar.schema';

@Controller('organization-calendar')
export class OrganizationCalendarController {
  constructor(private readonly calendarService: OrganizationCalendarService) {}

  @Post()
  create(@Body() createCalendarDto: CreateCalendarDto): Promise<Calendar> {
    return this.calendarService.create(createCalendarDto);
  }

  @Get()
  findAll(): Promise<Calendar[]> {
    return this.calendarService.findAll();
  }

  @Get(':year')
  findOne(@Param('year', ParseIntPipe) year: number): Promise<Calendar> {
    return this.calendarService.findByYear(year);
  }

  @Patch(':year')
  update(
    @Param('year', ParseIntPipe) year: number,
    @Body() updateCalendarDto: UpdateCalendarDto,
  ): Promise<Calendar> {
    return this.calendarService.update(year, updateCalendarDto);
  }

  @Delete(':year')
  remove(@Param('year', ParseIntPipe) year: number): Promise<void> {
    return this.calendarService.remove(year);
  }

  // --- Blocked Periods ---

  @Post(':year/blocked-periods')
  addBlockedPeriod(
    @Param('year', ParseIntPipe) year: number,
    @Body() createBlockedPeriodDto: CreateBlockedPeriodDto,
  ): Promise<Calendar> {
    return this.calendarService.addBlockedPeriod(year, createBlockedPeriodDto);
  }

  @Delete(':year/blocked-periods/:index')
  removeBlockedPeriod(
    @Param('year', ParseIntPipe) year: number,
    @Param('index', ParseIntPipe) index: number,
  ): Promise<Calendar> {
    return this.calendarService.removeBlockedPeriod(year, index);
  }
}