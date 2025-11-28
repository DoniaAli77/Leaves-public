import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { LeaveEntitlementsService } from './leave-entitlements.service';
import { CreateLeaveEntitlementDto } from './dto/create-leave-entitlement.dto';
import { UpdateLeaveEntitlementDto } from './dto/update-leave-entitlement.dto';

@Controller('leave-entitlements')
export class LeaveEntitlementsController {
  constructor(
    private readonly entitlementsService: LeaveEntitlementsService,
  ) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  create(@Body() dto: CreateLeaveEntitlementDto) {
    return this.entitlementsService.create(dto);
  }

  @Get()
  findAll() {
    return this.entitlementsService.findAll();
  }

  @Get(':employeeId')
  findByEmployee(@Param('employeeId') employeeId: string) {
    return this.entitlementsService.findByEmployee(employeeId);
  }

  @Put(':employeeId')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  update(
    @Param('employeeId') employeeId: string,
    @Body() dto: UpdateLeaveEntitlementDto,
  ) {
    return this.entitlementsService.update(employeeId, dto);
  }

  @Delete(':employeeId')
  remove(@Param('employeeId') employeeId: string): Promise<any> {
    return this.entitlementsService.removeByEmployee(employeeId);
  }
}