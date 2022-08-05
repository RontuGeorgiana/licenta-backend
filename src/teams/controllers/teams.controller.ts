import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-strategy/jwt-auth.guard';
import { UserParam } from 'src/common/decorators/user.decorator';
import { User } from 'src/users/entities/user.entity';
import { CreateTeamDto } from '../dtos/create-team.dto';
import { Team } from '../entities/team.entity';
import { TeamsService } from '../providers/teams.service';

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

  @UseGuards(JwtAuthGuard)
  @Patch('/rename-team/:id')
  async renameTeam(
    @Param('id') id: number,
    @Query('newName') newName: string,
    @UserParam() user: User,
  ): Promise<Team> {
    return this.teamsService.editTeamById(id, newName, user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteTeam(
    @Param('id') id: number,
    @UserParam() user: User,
  ): Promise<Team> {
    return this.teamsService.deleteTeamById(id, user);
  }
}
