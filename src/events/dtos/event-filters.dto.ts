import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { EventType } from 'src/common/enums/eventType.enum';

export class EventFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  start: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  end: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(EventType)
  type: EventType;
}
