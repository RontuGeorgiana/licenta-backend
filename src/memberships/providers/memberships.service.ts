import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TeamsService } from 'src/teams/providers/teams.service';
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

  public async createMembership(data: CreateMembershipDto) {
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
        error,
      });
    }
  }

  public async updateMembership(
    data: CreateMembershipDto,
  ): Promise<Membership> {
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
