import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrganizationCalendarService } from './organization-calendar.service';
import { OrganizationCalendarController } from './organization-calendar.controller';
import {
  OrganizationCalendar,
  OrganizationCalendarSchema,
} from './schemas/organization-calendar.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OrganizationCalendar.name, schema: OrganizationCalendarSchema },
    ]),
  ],
  controllers: [OrganizationCalendarController],
  providers: [OrganizationCalendarService],
  exports: [OrganizationCalendarService],
})
export class OrganizationCalendarModule {}