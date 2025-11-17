import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { LeaveRequestsService } from './leave-requests.service';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { UpdateLeaveRequestDto } from './dto/update-leave-request.dto';
import { ApproveRequestDto } from './dto/approve-request.dto';

@Controller('leave-requests')
export class LeaveRequestsController {
  constructor(private readonly service: LeaveRequestsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  create(@Body() dto: CreateLeaveRequestDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('/employee/:employeeId')
  findByEmployee(@Param('employeeId') employeeId: string) {
    return this.service.findByEmployee(employeeId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  update(@Param('id') id: string, @Body() dto: UpdateLeaveRequestDto) {
    return this.service.update(id, dto);
  }

  @Put(':id/cancel')
  cancel(@Param('id') id: string, @Body('requestedBy') requestedBy: string) {
    return this.service.cancel(id, requestedBy);
  }

  @Put(':id/approve/manager')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  managerApprove(@Param('id') id: string, @Body() dto: ApproveRequestDto) {
    return this.service.managerApprove(id, dto.approverId);
  }

  @Put(':id/reject/manager')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  managerReject(
    @Param('id') id: string,
    @Body() dto: ApproveRequestDto,
  ) {
    return this.service.managerReject(id, dto.approverId, (dto as any).comment);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    // optional: soft delete or cancel
    return this.service.cancel(id, 'system');
  }
}
