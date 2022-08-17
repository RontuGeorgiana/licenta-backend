import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsEnum, IsOptional } from 'class-validator';
import { EventType } from 'src/common/enums/eventType.enum';

export class EventFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  start: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  end: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(EventType)
  type: EventType;
}
