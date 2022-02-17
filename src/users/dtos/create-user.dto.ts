import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'First Name' })
  @MinLength(1)
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Last name' })
  @MinLength(1)
  @IsString()
  lastName: string;

  @ApiProperty({ description: 'email' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'password' })
  @MinLength(8)
  @IsString()
  password: string;
}
