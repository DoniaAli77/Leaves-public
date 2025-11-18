import { IsOptional, IsObject, IsNumberString } from 'class-validator';

export class UpdateBalanceDto {
  @IsOptional()
  @IsObject()
  balances?: Record<string, number>;

  @IsOptional()
  @IsObject()
  pending?: Record<string, number>;

  @IsOptional()
  @IsObject()
  accrued?: Record<string, number>;
}
