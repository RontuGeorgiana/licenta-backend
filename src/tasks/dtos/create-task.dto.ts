import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Status } from 'src/common/enums/status.enum';

export class CreateTaskDto {
  @ApiProperty({ description: 'Folder id' })
  @IsNumber()
  folderId: number;

  @ApiProperty({ description: 'Task name' })
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
  @IsEnum(Status)
  status: Status = Status.TO_DO;

  @ApiProperty({ description: 'Task estimation' })
  @IsOptional()
  @IsNumber()
  estimation: number;

  @ApiProperty({ description: 'Task tags' })
  @IsOptional()
  tags: string[];

  @ApiProperty({ description: 'Task type' })
  @IsString()
  type: string = 'task';

  @ApiProperty({ description: 'Task parent' })
  @IsOptional()
  @IsNumber()
  parent: number;
}
