import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/common/enums/role.enum';
import { MembershipsService } from 'src/memberships/providers/memberships.service';
import { Repository } from 'typeorm';
import { CreateTeamDto } from '../dtos/create-team.dto';
import { Team } from '../entities/team.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @Inject(forwardRef(() => MembershipsService))
    private readonly membershipsService: MembershipsService,
  ) {}

  public async createTeam(user: User, { name }: CreateTeamDto) {
    const team: Partial<Team> = { name };
    let dbTeam;
    let result;

    try {
      dbTeam = await this.teamRepository.create(team);

      result = await this.teamRepository.save(dbTeam);
    } catch (error) {
      throw new BadRequestException({
        error: { message: `team couldn't be created` },
      });
    }

    const ownerMembership = {
      userId: user.id,
      teamId: dbTeam.id,
      role: Role.Owner,
    };

    await this.membershipsService.createMembership(ownerMembership, null, true);

    return result;
  }

  public async getTeamById(teamId: number): Promise<Team> {
    if (!teamId) {
      throw new BadRequestException({
        error: teamId,
      });
    }

    const team = this.teamRepository.findOne(teamId);

    if (!team) {
      throw new NotFoundException({
        error: teamId,
      });
    }

    return team;
  }

  public async getTeamsByUser(user: User): Promise<any> {
    const query = this.teamRepository
      .createQueryBuilder('team')
      .select(['team.id', 'team.name', 'memberships.role'])
      .where(`memberships.userId = ${user.id}`)
      .leftJoin('team.memberships', 'memberships')
      .leftJoinAndSelect('team.spaces', 'spaces');

    try {
      const results = await query.getMany();
      const response = results.map(({ memberships, ...team }) => {
        return {
          ...team,
          role: memberships[0].role,
        };
      });
      return response;
    } catch (error) {
      throw new BadRequestException({
        error,
      });
    }
  }
}
