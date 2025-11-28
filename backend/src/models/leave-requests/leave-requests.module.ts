import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeaveRequestsController } from './leave-requests.controller';
import { LeaveRequestsService } from './leave-requests.service';
import { LeaveRequest, LeaveRequestSchema } from './schemas/leave-request.schema';
import { Attachment, AttachmentSchema } from './schemas/attachment.schema'; // 1. Import Attachment Schema
@Module({
  imports: [
    MongooseModule.forFeature([{ name: LeaveRequest.name, schema: LeaveRequestSchema },
      { name: Attachment.name, schema: AttachmentSchema },]),
  ],
  controllers: [LeaveRequestsController],
  providers: [LeaveRequestsService],
  exports: [LeaveRequestsService],
})
export class LeaveRequestsModule {}
