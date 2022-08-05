import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class MembershipFilterDto {
  @ApiPropertyOptional({ description: 'Max number returned' })
  @IsNumber()
  @IsOptional()
  max: number;

  @ApiPropertyOptional({ description: 'Search member' })
  @IsString()
  @IsOptional()
  search: string;
}
