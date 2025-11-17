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
import { EmployeeLeaveBalanceService } from './employee-leave-balance.service';
import { CreateBalanceDto } from './dto/create-balance.dto';
import { UpdateBalanceDto } from './dto/update-balance.dto';

@Controller('employee-leave-balance')
export class EmployeeLeaveBalanceController {
  constructor(
    private readonly balanceService: EmployeeLeaveBalanceService,
  ) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  create(@Body() dto: CreateBalanceDto) {
    return this.balanceService.create(dto);
  }

  @Get()
  findAll() {
    return this.balanceService.findAll();
  }

  @Get(':employeeId')
  findByEmployee(@Param('employeeId') employeeId: string) {
    return this.balanceService.findByEmployee(employeeId);
  }

  @Put(':employeeId')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  update(
    @Param('employeeId') employeeId: string,
    @Body() dto: UpdateBalanceDto,
  ) {
    return this.balanceService.update(employeeId, dto);
  }

  @Delete(':employeeId')
  remove(@Param('employeeId') employeeId: string) {
    return this.balanceService.removeByEmployee(employeeId);
  }
}
export default EmployeeLeaveBalanceController;
