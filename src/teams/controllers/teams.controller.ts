import { Body, Controller, Get, Post, Query, UseFilters } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { ApiTags } from '@nestjs/swagger';
import { CreateTeamDto } from '../dtos/create-team.dto';
import { Team } from '../entities/team.entity';
import { TeamsService } from '../providers/teams.service';

@UseFilters(BaseExceptionFilter)
@ApiTags('teams')
@Controller({ path: '/teams' })
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post('/create-team')
  async createTeam(
    @Body() createTeamBody: CreateTeamDto,
    @Query('user_id') userId: number,
  ): Promise<Team> {
    return this.teamsService.createTeam(userId, createTeamBody);
  }

  @Get()
  async getTeamsByUsers(@Query('user_id') userId: number): Promise<Object[]> {
    return this.teamsService.getTeamsByUser(userId);
  }
}
