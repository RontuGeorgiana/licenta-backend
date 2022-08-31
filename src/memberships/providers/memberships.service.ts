import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/common/enums/role.enum';
import { EventsService } from 'src/events/providers/events.service';
import { TeamsService } from 'src/teams/providers/teams.service';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/providers/users.service';
import { DeleteResult, Repository } from 'typeorm';
import { CreateMembershipDto } from '../dto/create-membership.dto';
import { MembershipFilterDto } from '../dto/membership-filter.dto';
import { UpdateMembershipDto } from '../dto/update-membership.dto';
import { Membership } from '../entities/membership.entity';

@Injectable()
export class MembershipsService {
  constructor(
    @InjectRepository(Membership)
    private readonly membershipRepository: Repository<Membership>,
    @Inject(forwardRef(() => TeamsService))
    private readonly teamsService: TeamsService,
    private readonly usersService: UsersService,
    private readonly eventsService: EventsService,
  ) {}

  public async createMembership(
    data: CreateMembershipDto,
    operator: User,
    systemAction: boolean,
  ) {
    if (!systemAction) {
      if (!operator) {
        throw new BadRequestException({ operator });
      }
      const operatorRole = await this.usersService.getUserRole(
        operator.id,
        data.teamId,
      );

      if (
        ![Role.Admin.valueOf(), Role.Owner.valueOf()].includes(operatorRole)
      ) {
        throw new BadRequestException({
          error: { operatorRole },
        });
      }

      if (data.role === Role.Owner && operatorRole !== Role.Owner) {
        throw new BadRequestException({
          error: { operatorRole, role: data.role },
        });
      }
    }

    const team = await this.teamsService.getTeamById(
      data.teamId,
      operator,
      systemAction,
    );

    if (!team) {
      throw new NotFoundException({
        error: data.teamId,
      });
    }

    const user = await this.usersService.getUserByEmail(data.email);

    if (!user) {
      throw new NotFoundException({
        error: data.email,
      });
    }

    const membership: Partial<Membership> = {
      userId: user.id,
      teamId: team.id,
      role: data.role,
    };

    try {
      const dbMembership = await this.membershipRepository.create(membership);
      const result = await this.membershipRepository.save(dbMembership);
      return result;
    } catch (error) {
      throw new BadRequestException({
        error: { message: 'membership failed to create' },
      });
    }
  }

  public async bulkCreateMemberships(
    teamId: number,
    data: any,
    operator: User,
  ): Promise<Membership[]> {
    if (!operator) {
      throw new BadRequestException({ operator });
    }

    const operatorRole = await this.usersService.getUserRole(
      operator.id,
      teamId,
    );

    if (![Role.Admin.valueOf(), Role.Owner.valueOf()].includes(operatorRole)) {
      throw new BadRequestException({
        error: { operatorRole },
      });
    }

    data.forEach((user) => {
      if (user.role === Role.Owner && operatorRole !== Role.Owner) {
        throw new BadRequestException({
          error: { operatorRole, role: user.role },
        });
      }
    });

    const team = await this.teamsService.getTeamById(teamId, operator);

    if (!team) {
      throw new NotFoundException({
        error: teamId,
      });
    }

    const users = await this.usersService.getUsersByEmails(
      data.map((user) => user.email),
    );

    if (!users || users.length === 0) {
      throw new NotFoundException({
        error: data,
      });
    }

    const memberships: Partial<Membership>[] = data.map((user) => {
      return {
        userId: user.userId,
        role: user.role,
        teamId,
      };
    });

    try {
      const dbMemberships = await this.membershipRepository.create(memberships);
      const result = await this.membershipRepository.save(dbMemberships);
      return result;
    } catch (error) {
      throw new BadRequestException({
        error: { message: 'memberships failed to create' },
      });
    }
  }

  public async getMembershipsByTeam(
    teamId: number,
    user: User,
    filter: MembershipFilterDto,
    onlyAvailable: boolean = false,
  ) {
    if (!user) {
      throw new ForbiddenException({
        user,
      });
    }

    if (!teamId) {
      throw new BadRequestException({
        error: { teamId },
      });
    }

    const userRole = await this.usersService.getUserRole(user.id, teamId);

    // if (![Role.Admin.valueOf(), Role.Owner.valueOf()].includes(userRole)) {
    //   throw new ForbiddenException({
    //     error: { userRole },
    //   });
    // }

    const query = this.membershipRepository
      .createQueryBuilder('membership')
      .select([
        'membership.id AS id',
        'membership.teamId AS teamId',
        'membership.userId AS userId',
        'membership.role AS role',
        'user.firstName AS firstName',
        'user.lastName AS lastName',
        'user.email AS email',
      ])
      .leftJoin('membership.user', 'user')
      .where(`membership.teamId = ${teamId}`);

    if (filter?.search && filter?.search !== '') {
      const searchString = `((user.firstName LIKE '%${filter?.search}%') OR (user.lastName LIKE '%${filter?.search}%'))`;
      query.andWhere(searchString);
    }

    if (filter?.max) {
      query.limit(filter?.max);
    }

    try {
      const result = await query.execute();

      if (onlyAvailable) {
        const userIds = await result.map((res: any) => res.userid);

        const awayMembers = await this.eventsService.getLeavesByUserIds(
          userIds,
          teamId,
        );

        return result.filter((res) => !awayMembers.includes(res.userid));
      }

      return result;
    } catch (error) {
      throw new BadRequestException({
        error: { teamId },
      });
    }
  }

  public async updateMembership(
    data: UpdateMembershipDto,
    operator: User,
  ): Promise<Membership> {
    if (!operator) {
      throw new BadRequestException({ operator });
    }
    const operatorRole = await this.usersService.getUserRole(
      operator.id,
      data.teamId,
    );

    if (![Role.Admin.valueOf(), Role.Owner.valueOf()].includes(operatorRole)) {
      throw new BadRequestException({
        error: { operatorRole },
      });
    }

    const membership = await this.membershipRepository
      .createQueryBuilder('membership')
      .select(['membership.id', 'membership.role'])
      .where(
        `membership.userId = ${data.userId} AND membership.teamId = ${data.teamId}`,
      )
      .getOne();

    if (!membership) {
      throw new NotFoundException({
        error: { data },
      });
    }

    if (membership.role === Role.Owner && operatorRole !== Role.Owner) {
      throw new BadRequestException({
        error: { operatorRole, role: membership.role },
      });
    }

    const updatedMembership = {
      ...membership,
      role: data.role,
    };

    try {
      const result = await this.membershipRepository.save(updatedMembership);
      return result;
    } catch (error) {
      throw new BadRequestException({
        error,
      });
    }
  }

  public async deleteMembership(
    teamId: number,
    userId: number,
    operator: User,
    self: boolean = false,
  ): Promise<DeleteResult> {
    if (!teamId || (!userId && !self)) {
      throw new BadRequestException({
        error: { teamId, userId },
      });
    }

    if (!operator) {
      throw new ForbiddenException({
        error: { operator },
      });
    }

    const membershipToDelete = await this.membershipRepository.findOne({
      where: [{ teamId, userId: self ? operator.id : userId }],
    });

    if (!membershipToDelete) {
      throw new NotFoundException({
        error: { teamId, userId: self ? operator.id : userId },
      });
    }

    const numberOfOwners = await this.membershipRepository.count({
      where: [{ teamId, role: Role.Owner.valueOf() }],
    });

    const operatorRole = await this.usersService.getUserRole(
      operator.id,
      teamId,
    );

    if (!self) {
      switch (operatorRole) {
        case Role.User.valueOf():
          if (operator.id !== userId) {
            throw new ForbiddenException({
              error: { operatorRole },
            });
          }
          break;
        case Role.Admin.valueOf():
          if (
            operator.id !== userId &&
            membershipToDelete.role !== Role.User.valueOf()
          ) {
            throw new ForbiddenException({
              error: { operatorRole, memberRole: membershipToDelete.role },
            });
          }
          break;
        case Role.Owner.valueOf():
          if (
            membershipToDelete.role === Role.Owner.valueOf() &&
            numberOfOwners < 2
          ) {
            throw new BadRequestException({
              error: { numberOfOwners },
            });
          }
          break;
      }
    }

    try {
      const result = await this.membershipRepository.delete(
        membershipToDelete.id,
      );
      return result;
    } catch (error) {
      throw new BadRequestException({
        error,
      });
    }
  }
}
