import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber } from 'class-validator';
import { Role } from 'src/common/enums/role.enum';

export class UpdateMembershipDto {
  @ApiProperty({ description: 'Team id' })
  @IsNumber()
  teamId: number;

  @ApiProperty({ description: 'User email' })
  @IsNumber()
  userId: number;

  @ApiProperty({ description: 'User role within the team' })
  @IsEnum(Role)
  role: Role = Role.User;
}
