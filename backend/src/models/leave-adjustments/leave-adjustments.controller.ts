import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { LeaveAdjustmentsService } from './leave-adjustments.service';
import { CreateAdjustmentDto } from './dto/create-adjustment.dto';
import { ApproveAdjustmentDto } from './dto/approve-adjustment.dto';

@Controller('leave-adjustments')
export class LeaveAdjustmentsController {
  constructor(private readonly service: LeaveAdjustmentsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  create(@Body() dto: CreateAdjustmentDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Put(':id/approve')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  approve(@Param('id') id: string, @Body() dto: ApproveAdjustmentDto) {
    return this.service.approve(id, dto);
  }
}
