import {
  IsString,
  IsBoolean,
  IsOptional,
  IsNumber,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateLeaveTypeDto {
  @IsString()
  @MaxLength(50, { message: 'Code must not exceed 50 characters' })
  code: string;

  @IsString()
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name: string;

  // Use the ObjectId as string for the category reference
  @IsString()
  categoryId: string;

  @IsBoolean()
  @IsOptional()
  requiresAttachment?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Attachment type must not exceed 100 characters' })
  attachmentType?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  maxDurationDays?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  minTenureMonths?: number;

  @IsBoolean()
  @IsOptional()
  paid?: boolean;

  @IsBoolean()
  @IsOptional()
  deductible?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  description?: string;
}
