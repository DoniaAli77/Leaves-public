import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrganizationCalendarController } from './organization-calendar.controller';
import { OrganizationCalendarService } from './organization-calendar.service';
import { Calendar, CalendarSchema } from './schemas/calendar.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Calendar.name, schema: CalendarSchema },
    ]),
  ],
  controllers: [OrganizationCalendarController],
  providers: [OrganizationCalendarService],
})
export class OrganizationCalendarModule {}