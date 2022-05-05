import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateSpaceDto {
  @ApiProperty({ description: 'Space name' })
  @MinLength(1)
  @MaxLength(32)
  @IsString()
  name: string;

  @ApiProperty({ description: 'Team id' })
  @IsNumber()
  teamId: number;
}
