import { Controller, Body, Post, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { LoginDto } from '../dtos/login.dto';
import { LocalAuthGuard } from '../local-strategy/local-auth.guard';
import { AuthService } from '../providers/auth.service';

@ApiTags('auth')
@Controller({ path: '/auth' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @ApiBody({ type: LoginDto })
  @Post('/login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }
}
