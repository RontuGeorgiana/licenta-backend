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
import { CreateEventDto } from '../dtos/create-event.dto';
import { EventFilterDto } from '../dtos/event-filters.dto';
import { ResolveEventDto } from '../dtos/resolve-event.dto';
import { EventsService } from '../providers/events.service';

@UseFilters(BaseExceptionFilter)
@ApiTags('events')
@ApiBearerAuth()
@Controller({ path: '/events' })
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createEvent(@Body() data: CreateEventDto, @UserParam() user: User) {
    return await this.eventsService.createEvent(data, user);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getEventsByTeam(
    @Query('teamId') teamId: number,
    @Query() filters: EventFilterDto,
    @UserParam() user: User,
  ) {
    return await this.eventsService.getUserEventsByTeam(teamId, user, filters);
  }

  @UseGuards(JwtAuthGuard)
  @Get('event/:id')
  async getEventById(
    @Param('id') eventId: number,
    @Query('teamId') teamId: number,
    @UserParam() user: User,
  ) {
    return await this.eventsService.getEventById(eventId, teamId, user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('pending')
  async getPendingEvents(
    @Query('teamId') teamId: number,
    @UserParam() user: User,
  ) {
    return await this.eventsService.getPendingEvents(teamId, user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/resolve')
  async resolveEvent(@Body() data: ResolveEventDto, @UserParam() user: User) {
    return await this.eventsService.resolveEvent(data, user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  async deleteEventById(
    @Param('id') eventId: number,
    @Query('teamId') teamId: number,
    @UserParam() user: User,
  ) {
    return await this.eventsService.deleteEventById(eventId, teamId, user);
  }
}
