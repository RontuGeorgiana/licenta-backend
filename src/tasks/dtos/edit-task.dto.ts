import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Status } from 'src/common/enums/status.enum';

export class EditTaskDto {
  @ApiProperty({ description: 'Task id' })
  @IsNumber()
  taskId: number;

  @ApiProperty({ description: 'Task name' })
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Task description' })
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty({ description: 'Task asignee' })
  @IsOptional()
  @IsNumber()
  asignee: number;

  @ApiProperty({ description: 'Task due date' })
  @IsOptional()
  @IsDate()
  dueDate: Date;

  @ApiProperty({ description: 'Task priority' })
  @IsOptional()
  @IsNumber()
  priority: number;

  @ApiProperty({ description: 'Task status' })
  @IsOptional()
  @IsEnum(Status)
  status: Status = Status.TO_DO;

  @ApiProperty({ description: 'Estimated time' })
  @IsOptional()
  @IsNumber()
  estimation: number;

  @ApiProperty({ description: 'Task time tracked' })
  @IsOptional()
  @IsNumber()
  timeTracked: number;

  @ApiProperty({ description: 'Task tags' })
  @IsOptional()
  tags: string[];
}
