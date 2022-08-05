import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber } from 'class-validator';
import { Role } from 'src/common/enums/role.enum';

interface IMembershipData {
  userId: number;
  role: Role;
}

export class BulkCreateMembershipDto {
  @ApiProperty({ description: 'Team id' })
  @IsNumber()
  teamId: number;

  @ApiProperty({ description: 'Users data' })
  @IsArray()
  data: IMembershipData[];
}
