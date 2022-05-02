import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-strategy/jwt-auth.guard';
import { UserParam } from 'src/common/decorators/user.decorator';
import { CreateTeamDto } from '../dtos/create-team.dto';
import { Team } from '../entities/team.entity';
import { TeamsService } from '../providers/teams.service';
import { User } from 'src/users/entities/user.entity';

@UseFilters(BaseExceptionFilter)
@ApiTags('teams')
@ApiBearerAuth()
@Controller({ path: '/teams' })
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @UseGuards(JwtAuthGuard)
  // eslint-disable-next-line prettier/prettier
  @Post('/create-team')
  async createTeam(
    @Body() createTeamBody: CreateTeamDto,
    @UserParam() user: User,
  ): Promise<Team> {
    return this.teamsService.createTeam(user, createTeamBody);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getTeamsByUsers(@UserParam() user: User): Promise<any> {
    return this.teamsService.getTeamsByUser(user);
  }
}
