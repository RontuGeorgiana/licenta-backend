import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateTeamDto {
  @ApiProperty({ description: 'Team name' })
  @MinLength(1)
  @MaxLength(32)
  @IsString()
  name: string;
}
