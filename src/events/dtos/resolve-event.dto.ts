import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber } from 'class-validator';

export class ResolveEventDto {
  @ApiProperty()
  @IsNumber()
  eventId: number;

  @ApiProperty()
  @IsNumber()
  teamId: number;

  @ApiProperty()
  @IsBoolean()
  approved: boolean;
}
