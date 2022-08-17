import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventType } from 'src/common/enums/eventType.enum';
import { Role } from 'src/common/enums/role.enum';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/providers/users.service';
import { In, Repository } from 'typeorm';
import { CreateEventDto } from '../dtos/create-event.dto';
import { EventFilterDto } from '../dtos/event-filters.dto';
import { ResolveEventDto } from '../dtos/resolve-event.dto';
import { Event } from '../entities/event.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    private readonly usersService: UsersService,
  ) {}

  public async createEvent(data: CreateEventDto, user: User) {
    if (!user) {
      throw new ForbiddenException({
        error: {
          message: 'User must be logged in',
        },
      });
    }

    if (!data.teamId) {
      throw new BadRequestException({
        error: {
          message: 'Team id is invalid',
        },
      });
    }

    const userRole = await this.usersService.getUserRole(user.id, data.teamId);

    if (!userRole) {
      throw new ForbiddenException({
        error: {
          message: 'User must be part of team',
        },
      });
    }

    const newEvent: Partial<Event> = {
      ...data,
      approved: data.type === EventType.LEAVE ? false : null,
      organizerId: user.id,
    };

    try {
      const dbEvent = await this.eventRepository.create(newEvent);
      const result = await this.eventRepository.save(dbEvent);
      return result;
    } catch (error) {
      throw new BadRequestException({
        error,
      });
    }
  }

  public async getUserEventsByTeam(
    teamId: number,
    user: User,
    filters: EventFilterDto,
  ) {
    if (!user) {
      throw new ForbiddenException({
        error: {
          message: 'User must be logged in',
        },
      });
    }

    if (!teamId) {
      throw new BadRequestException({
        error: {
          message: 'Team id is invalid',
        },
      });
    }

    const query = this.eventRepository
      .createQueryBuilder('event')
      .select(['event.id', 'event.type', 'event.start', 'event.name'])
      .where(
        `((event.organizerId = ${user.id}) OR (${user.id} = ANY(event.participants))) AND event.teamId = ${teamId}`,
      );

    if (filters.start) {
      query.andWhere(`'${filters.start}'::date <= event.start`);
    }

    if (filters.end) {
      query.andWhere(`event.end < '${filters.end}'::date`);
    }

    if (filters.type) {
      query.andWhere(`'${filters.type}' = event.type`);
    }

    try {
      const result = await query.getMany();
      return result;
    } catch (error) {
      throw new BadRequestException({
        error,
      });
    }
  }

  public async getEventById(id: number, teamId: number, user: User) {
    if (!user) {
      throw new ForbiddenException({
        error: {
          message: 'User must be logged in',
        },
      });
    }

    const userRole = await this.usersService.getUserRole(user.id, teamId);

    if (!id) {
      throw new BadRequestException({
        error: {
          message: 'Event id is invalid',
        },
      });
    }

    try {
      const result = await this.eventRepository.findOne(id);
      const organizer = await this.usersService.getMinimalUserById(
        result.organizerId,
      );
      let participants;
      if (result.participants !== null) {
        participants = await Promise.all(
          result.participants.map((participant: any) =>
            this.usersService.getMinimalUserById(participant),
          ),
        );
      } else {
        participants = null;
      }

      const processedResult = {
        ...result,
        organizer,
        participants,
        deletable:
          user.id === result.organizerId ||
          [Role.Admin.valueOf(), Role.Owner.valueOf()].includes(userRole),
      };
      return processedResult;
    } catch (error) {
      throw new BadRequestException({
        error,
      });
    }
  }

  public async getPendingEvents(teamId: number, user: User) {
    if (!user) {
      throw new ForbiddenException({
        error: {
          message: 'User must be logged in',
        },
      });
    }

    if (!teamId) {
      throw new BadRequestException({
        error: {
          message: 'Team id is invalid',
        },
      });
    }

    const userRole = await this.usersService.getUserRole(user.id, teamId);

    if (
      !userRole &&
      ![Role.Admin.valueOf(), Role.Owner.valueOf()].includes(userRole)
    ) {
      throw new ForbiddenException({
        error: {
          message: 'User does not have required permissions',
        },
      });
    }

    const query = this.eventRepository
      .createQueryBuilder('event')
      .select(['event.id', 'event.type', 'event.start', 'event.name'])
      .where(`event.teamId = ${teamId} AND event.approved = FALSE`);

    try {
      const result = await query.getMany();
      return result;
    } catch (error) {
      throw new BadRequestException({
        error,
      });
    }
  }

  public async resolveEvent(data: ResolveEventDto, user: User) {
    if (!user) {
      throw new ForbiddenException({
        error: {
          message: 'User must be logged in',
        },
      });
    }

    if (!data.teamId) {
      throw new BadRequestException({
        error: {
          message: 'Team id is invalid',
        },
      });
    }

    const userRole = await this.usersService.getUserRole(user.id, data.teamId);

    if (
      !userRole &&
      ![Role.Admin.valueOf(), Role.Owner.valueOf()].includes(userRole)
    ) {
      throw new ForbiddenException({
        error: {
          message: 'User does not have required permissions',
        },
      });
    }

    let event = await this.eventRepository.findOne(data.eventId);

    if (!event) {
      throw new NotFoundException({
        error: {
          event: data.eventId,
        },
      });
    }

    if (data.approved) {
      try {
        event = {
          ...event,
          approved: data.approved,
        };
        const result = await this.eventRepository.save(event);
        return result;
      } catch (error) {
        throw new BadRequestException({
          error,
        });
      }
    } else {
      try {
        const result = await this.eventRepository.delete(event.id);
        return result;
      } catch (error) {
        throw new BadRequestException({
          error,
        });
      }
    }
  }

  public async deleteEventById(eventId: number, teamId: number, user: User) {
    if (!user) {
      throw new ForbiddenException({
        error: {
          message: 'User must be logged in',
        },
      });
    }

    if (!teamId) {
      throw new BadRequestException({
        error: {
          message: 'Team id is invalid',
        },
      });
    }

    const userRole = await this.usersService.getUserRole(user.id, teamId);

    const event = await this.eventRepository.findOne(eventId);

    if (
      !userRole &&
      ![Role.Admin.valueOf(), Role.Owner.valueOf()].includes(userRole) &&
      user.id !== event.organizerId
    ) {
      throw new ForbiddenException({
        error: {
          message: 'User does not have required permissions',
        },
      });
    }

    try {
      const result = await this.eventRepository.delete(event.id);
      return result;
    } catch (error) {
      throw new BadRequestException({
        error,
      });
    }
  }

  public async deleteEventsByTeamIds(teamIds: number[]) {
    if (!teamIds || teamIds.length === 0) {
      throw new BadRequestException({
        error: { teamIds },
      });
    }

    try {
      const result = await this.eventRepository.update(
        { teamId: In(teamIds) },
        { deletedOn: new Date() },
      );
      return result;
    } catch (error) {
      throw new BadRequestException({ error });
    }
  }

  public async getLeavesByUserIds(userIds: number[]) {
    if (!userIds || userIds.length == 0) {
      throw new BadRequestException({
        error: {
          messages: 'Invalid user ids',
        },
      });
    }

    const query = this.eventRepository
      .createQueryBuilder('event')
      .select(['event.organizerId'])
      .where(
        `(event.organizerId IN (${userIds})) AND (event.start <= ${new Date()}) AND (event.end >= ${new Date()}) AND (event.type = 'leave')`,
      );

    try {
      const result = query.getMany();
      return result;
    } catch (error) {
      throw new BadRequestException({
        error,
      });
    }
  }
}
