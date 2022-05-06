import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateFolderDto {
  @ApiProperty({ description: 'Folder name' })
  @MinLength(1)
  @MaxLength(32)
  @IsString()
  name: string;

  @ApiProperty({ description: 'Current folder id' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  parentId: number;

  @ApiProperty({ description: 'Space id' })
  @IsNumber()
  @Min(1)
  spaceId: number;

  @ApiProperty({ description: 'Team id' })
  @IsNumber()
  @Min(1)
  teamId: number;
}
