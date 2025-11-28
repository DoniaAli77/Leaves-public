import { Controller, Get, Post, Body } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LeaveCategory } from './schemas/leave-category.schema';

// 👇 CHANGE THIS: Remove "api/v1/" because it's already global
@Controller('leave-categories') 
export class LeaveCategoriesController {
  constructor(@InjectModel(LeaveCategory.name) private catModel: Model<LeaveCategory>) {}

  @Post()
  async create(@Body() body: any) {
    return this.catModel.create(body);
  }

  @Get()
  async findAll() {
    return this.catModel.find().exec();
  }
}