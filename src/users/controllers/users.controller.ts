import { Body, Controller, Post, UseFilters } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UsersService } from '../providers/users.service';

@UseFilters(BaseExceptionFilter)
@Controller({ path: '/users' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/create-user')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.addUser(createUserDto);
  }
}
