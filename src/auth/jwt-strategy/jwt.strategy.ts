import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from '../interfaces/JwtPayload.interface';
import { UsersService } from 'src/users/providers/users.service';
import { User } from 'src/users/entities/user.entity';
import { plainToClass } from 'class-transformer';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    try {
      const user: User = await this.userService.getUserById(payload.sub);
      return plainToClass(User, user);
    } catch (err) {
      throw new UnauthorizedException(
        'You need to be authenticated with a valid user to access this API.',
      );
    }
  }
}
