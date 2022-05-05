import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/common/enums/role.enum';
import { TeamsService } from 'src/teams/providers/teams.service';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/providers/users.service';
import { Repository } from 'typeorm';
import { CreateMembershipDto } from '../dto/create-membership.dto';
import { Membership } from '../entities/membership.entity';

@Injectable()
export class MembershipsService {
  constructor(
    @InjectRepository(Membership)
    private readonly membershipRepository: Repository<Membership>,
    @Inject(forwardRef(() => TeamsService))
    private readonly teamsService: TeamsService,
    private readonly usersService: UsersService,
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

    const team = await this.teamsService.getTeamById(data.teamId);

    if (!team) {
      throw new NotFoundException({
        error: data.teamId,
      });
    }

    const user = await this.usersService.getUserById(data.userId);

    if (!user) {
      throw new NotFoundException({
        error: data.userId,
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

  public async updateMembership(
    data: CreateMembershipDto,
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

    if (data.role === Role.Owner && operatorRole !== Role.Owner) {
      throw new BadRequestException({
        error: { operatorRole, role: data.role },
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
}
