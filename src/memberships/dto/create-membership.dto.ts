import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber } from 'class-validator';
import { Role } from 'src/common/enums/role.enum';

export class CreateMembershipDto {
  @ApiProperty({ description: 'Team id' })
  @IsNumber()
  teamId: number;

  @ApiProperty({ description: 'User id' })
  @IsNumber()
  userId: number;

  @ApiProperty({ description: 'User role within the team' })
  @IsEnum(Role)
  role: Role = Role.User;
}
