import { IsArray, IsDateString, IsIn, IsMongoId, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateProjectDto {
  @IsString() @MinLength(1) name!: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsIn(['low','medium','high','urgent']) priority?: string;
  @IsOptional() @IsIn(['planning','active','completed','on-hold']) status?: string;
  @IsOptional() @IsMongoId() lead?: string;
  @IsOptional() @IsArray() @IsMongoId({ each: true }) members?: string[];
  @IsOptional() @IsDateString() dueDate?: string;
}
