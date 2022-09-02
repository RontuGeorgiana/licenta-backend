import { Body, Controller, Get, Post, UseFilters } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { ApiTags } from '@nestjs/swagger';
import { UserParam } from 'src/common/decorators/user.decorator';
import { CreateUserDto } from '../dtos/create-user.dto';
import { User } from '../entities/user.entity';
import { UsersService } from '../providers/users.service';

@UseFilters(BaseExceptionFilter)
@ApiTags('users')
@Controller({ path: '/users' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/create-user')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.addUser(createUserDto);
  }

  @Get('/details')
  getUserDetails(@UserParam() user: User) {
    return this.usersService.getMinimalUserById(user.id);
  }
}
