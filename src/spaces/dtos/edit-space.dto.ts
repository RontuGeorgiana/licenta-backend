import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, MaxLength, MinLength } from 'class-validator';

export class EditSpaceDto {
  @ApiProperty({ description: 'Space name' })
  @MinLength(1)
  @MaxLength(32)
  @IsString()
  name: string;

  @ApiProperty({ description: 'Space id' })
  @IsNumber()
  spaceId: number;
}
