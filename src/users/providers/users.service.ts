import * as bcrypt from 'bcryptjs';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

    try {
      const hashedPass = bcrypt.hash(createUserDto.password, 10);

      const userEntity = this.userRepository.create({
        ...createUserDto,
        password: await hashedPass,
      });
      user = await this.userRepository.save(userEntity);

      return user;
    } catch (error) {
      throw new BadRequestException({
        error: { error, createUserDto },
      });
    }
  }

  public async getUserById(userId: number) {
    if (!userId) {
      throw new BadRequestException({
        error: { userId },
      });
    }

    const user = this.userRepository.findOne(userId);

    if (!user) {
      throw new NotFoundException({
        error: { userId },
      });
    }

    return user;
  }

  public async getUserByEmail(email: string) {
    if (!email) {
      throw new BadRequestException({
        error: { email },
      });
    }

    const user = this.userRepository.findOne({ email });

    if (!user) {
      throw new NotFoundException({
        error: { email },
      });
    }
    return user;
  }
}
