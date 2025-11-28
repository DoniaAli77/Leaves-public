//src/modules/leave-policies/leave-policies.controller.ts

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
} from '@nestjs/common';
import { LeavePoliciesService } from './leave-policies.service';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { UpdatePolicyDto } from './dto/update-policy.dto';

@Controller('leave-policies')
export class LeavePoliciesController {
  constructor(private readonly leavePoliciesService: LeavePoliciesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createPolicyDto: CreatePolicyDto) {
    return this.leavePoliciesService.create(createPolicyDto);
  }

  @Get()
  findAll() {
    return this.leavePoliciesService.findAll();
  }

  @Get('active')
  findActive() {
    return this.leavePoliciesService.findActive();
  }

  @Get('type/:policyType')
  findByType(@Param('policyType') policyType: string) {
    return this.leavePoliciesService.findByType(policyType);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leavePoliciesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePolicyDto: UpdatePolicyDto) {
    return this.leavePoliciesService.update(id, updatePolicyDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.leavePoliciesService.remove(id);
  }

  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.leavePoliciesService.deactivate(id);
  }

  @Patch(':id/activate')
  activate(@Param('id') id: string) {
    return this.leavePoliciesService.activate(id);
  }
}