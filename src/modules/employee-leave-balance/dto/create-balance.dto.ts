import { IsNotEmpty, IsObject, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class CreateBalanceDto {
  @IsNotEmpty()
  employeeId: string; // ObjectId string

  @IsOptional()
  @IsObject()
  balances?: Record<string, number>; // e.g. { "ANNUAL": 20 }
}
