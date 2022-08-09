import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Type } from 'src/common/enums/type.enum';
import { PriorityNumber } from '../../common/enums/priority.enum';

export class TaskFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assignee: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(PriorityNumber)
  priority: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(Type)
  type: Type;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search: string;
}
