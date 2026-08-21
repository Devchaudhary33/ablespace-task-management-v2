import { IsArray, IsDateString, IsIn, IsMongoId, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateTaskDto {
  @IsString() @MinLength(1) title!: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsIn(['todo','doing','completed','on-hold']) status?: string;
  @IsOptional() @IsIn(['low','medium','high','urgent']) priority?: string;
  @IsOptional() @IsMongoId() assignee?: string;
  @IsOptional() @IsMongoId() project?: string;
  @IsOptional() @IsMongoId() team?: string;
  @IsOptional() @IsDateString() dueDate?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) labels?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) resources?: string[];
}
