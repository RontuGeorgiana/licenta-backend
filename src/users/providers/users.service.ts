import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { AuthService } from 'src/auth/providers/auth.service';
import { Membership } from 'src/memberships/entities/membership.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../dtos/create-user.dto';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  public async addUser(createUserDto: CreateUserDto) {
    try {
      const hashedPass = bcrypt.hash(createUserDto.password, 10);

      const userEntity = this.userRepository.create({
        ...createUserDto,
        password: await hashedPass,
      });
      const { password, deletedOn, createdOn, updatedOn, ...data } =
        await this.userRepository.save(userEntity);
      const result = await this.authService.login(data);
      return result;
    } catch (error) {
      throw new BadRequestException({
        error: { error, createUserDto },
      });
    }
  }

  public async getUserById(userId: number, nullable: boolean = false) {
    if (!userId && !nullable) {
      throw new BadRequestException({
        error: { userId },
      });
    }

    if (!userId && nullable) {
      return null;
    }

    const user = this.userRepository.findOne(userId);

    if (!user && !nullable) {
      throw new NotFoundException({
        error: { userId },
      });
    }

    return user;
  }

  public async getMinimalUserById(userId: number) {
    if (!userId) {
      throw new BadRequestException({
        error: { userId },
      });
    }

    const user = await this.userRepository.findOne(userId);

    if (!user) {
      throw new NotFoundException({
        error: { userId },
      });
    }

    return {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      id: user.id,
    };
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

  public async getUsersByEmails(emails: string[]) {
    if (!emails || emails.length === 0) {
      throw new BadRequestException({
        error: { emails },
      });
    }

    const querry = this.userRepository
      .createQueryBuilder('user')
      .select(['user.id', 'user.firstName', 'user.lastName', 'user.email'])
      .where(`user.email IN ${emails}`);

    try {
      const result = await querry.getMany();
      return result;
    } catch (error) {
      throw new BadRequestException({
        error,
      });
    }
  }

  public async getUserRole(userId: number, teamId: number) {
    if (!userId) {
      throw new BadRequestException({
        error: { userId },
      });
    }
    if (!teamId) {
      throw new BadRequestException({
        error: { teamId },
      });
    }
    const querry = this.userRepository
      .createQueryBuilder('user')
      .select(['user.id'])
      .where(`user.id = ${userId}`)
      .leftJoinAndMapOne(
        'user.memberships',
        Membership,
        'membership',
        `user.id = membership.userId AND membership.teamId = ${teamId}`,
      );

    try {
      const role = await querry.getRawOne();
      return role.membership_role;
    } catch (error) {
      throw new BadRequestException({
        error,
      });
    }
  }
}
