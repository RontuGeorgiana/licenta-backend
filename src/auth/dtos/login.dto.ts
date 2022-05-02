import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'email' })
  @IsEmail()
  username: string;

  @ApiProperty({ description: 'password' })
  @MinLength(8)
  @IsString()
  password: string;
}
