import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class EditFolderDto {
  @ApiProperty({ description: 'Folder id' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Folder name' })
  @IsOptional()
  @MinLength(1)
  @MaxLength(32)
  @IsString()
  name: string;

  @ApiProperty({ description: 'Current folder PARENT' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  newParentId: number;

  @ApiProperty({ description: 'Child to remove' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  removeChild: number;
}
