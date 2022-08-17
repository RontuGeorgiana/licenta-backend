import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { EventType } from 'src/common/enums/eventType.enum';

export class CreateEventDto {
  @ApiProperty({ description: 'Team id' })
  @IsNumber()
  teamId: number;

  @ApiPropertyOptional({ description: 'Participants to invite' })
  @IsOptional()
  participants: number[];

  @ApiProperty({ description: 'Event type' })
  @IsEnum(EventType)
  type: EventType;

  @ApiProperty({ description: 'Event start date and time' })
  @IsDate()
  start: Date;

  @ApiProperty({ description: 'Event end date and time' })
  @IsDate()
  end: Date;

  @ApiProperty({ description: 'Event name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Event description' })
  @IsString()
  @IsOptional()
  description: string;

  @ApiPropertyOptional({ description: 'Event link' })
  @IsString()
  @IsOptional()
  link: string;
}
