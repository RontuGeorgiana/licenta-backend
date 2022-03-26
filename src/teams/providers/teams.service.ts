import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/common/enums/role.enum';
import { Membership } from 'src/memberships/entities/membership.entity';
import { MembershipsService } from 'src/memberships/providers/memberships.service';
import { Repository } from 'typeorm';
import { CreateTeamDto } from '../dtos/create-team.dto';
import { Team } from '../entities/team.entity';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @Inject(forwardRef(() => MembershipsService))
    private readonly membershipsService: MembershipsService,
  ) {}

  public async createTeam(userId: number, { name }: CreateTeamDto) {
    const team: Partial<Team> = { name };
    let dbTeam;
    let result;

    try {
      dbTeam = await this.teamRepository.create(team);

      result = await this.teamRepository.save(dbTeam);
    } catch (error) {
      throw new BadRequestException({
        error: { team },
      });
    }

    const ownerMembership = {
      userId,
      teamId: dbTeam.id,
      role: Role.Owner,
    };

    await this.membershipsService.createMembership(ownerMembership);

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

  public async getTeamsByUser(userId: number): Promise<Object[]> {
    const query = this.teamRepository
      .createQueryBuilder('team')
      .select(['team.id', 'team.name'])
      .leftJoinAndMapOne(
        'team.memberships',
        Membership,
        'memberships',
        `team.id = memberships.teamId AND memberships.userId = ${userId}`,
      );

    try {
      const results = await query.getRawMany();
      const response = results.map(
        ({ team_id, team_name, memberships_role }) => {
          return {
            id: team_id,
            name: team_name,
            role: memberships_role,
          };
        },
      );
      return response;
    } catch (error) {
      throw new BadRequestException({
        error,
      });
    }
  }
}
