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
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-strategy/jwt-auth.guard';
import { CreateTeamDto } from '../dtos/create-team.dto';
import { Team } from '../entities/team.entity';
import { TeamsService } from '../providers/teams.service';

@UseFilters(BaseExceptionFilter)
@ApiTags('teams')
@Controller({ path: '/teams' })
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/create-team')
  async createTeam(
    @Body() createTeamBody: CreateTeamDto,
    @Query('user_id') userId: number,
  ): Promise<Team> {
    return this.teamsService.createTeam(userId, createTeamBody);
  }

  @Get()
  async getTeamsByUsers(@Query('user_id') userId: number): Promise<any> {
    return this.teamsService.getTeamsByUser(userId);
  }
}
