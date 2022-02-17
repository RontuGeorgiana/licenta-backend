import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../dtos/create-user.dto';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  public async addUser(createUserDto: CreateUserDto) {
    let user: User;
    const userEntity = this.userRepository.create(createUserDto);
    user = await this.userRepository.save(userEntity);

    return user;
  }
}
