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
import { MembershipsService } from 'src/memberships/providers/memberships.service';
import { SpacesService } from 'src/spaces/providers/spaces.service';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/providers/users.service';
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
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => SpacesService))
    private readonly spacesService: SpacesService,
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
      email: user.email,
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

  public async editTeamById(
    teamId: number,
    newName: string,
    user: User,
  ): Promise<Team> {
    if (!user) {
      throw new BadRequestException({
        error: { user },
      });
    }

    if (!teamId) {
      throw new BadRequestException({
        error: { teamId },
      });
    }

    const userRole = await this.usersService.getUserRole(user.id, teamId);

    if (![Role.Admin, Role.Owner].includes(userRole)) {
      throw new ForbiddenException({
        error: { userRole },
      });
    }

    let teamToUpdate = await this.teamRepository.findOne(teamId);

    if (!teamToUpdate) {
      throw new BadRequestException({
        error: { teamToUpdate },
      });
    }

    try {
      teamToUpdate = { ...teamToUpdate, name: newName };
      const result = await this.teamRepository.save(teamToUpdate);
      return result;
    } catch (error) {
      throw new BadRequestException({
        error,
      });
    }
  }

  public async deleteTeamById(teamId: number, user: User): Promise<Team> {
    if (!user) {
      throw new BadRequestException({
        error: { user },
      });
    }

    if (!teamId) {
      throw new BadRequestException({
        error: { teamId },
      });
    }

    const userRole = await this.usersService.getUserRole(user.id, teamId);

    if (userRole !== Role.Owner.valueOf()) {
      throw new ForbiddenException({
        error: {
          userRole,
        },
      });
    }

    let teamToDelete = await this.teamRepository.findOne(teamId);

    if (!teamToDelete) {
      throw new NotFoundException({
        error: { teamId },
      });
    }

    teamToDelete = {
      ...teamToDelete,
      deletedOn: new Date(),
    };

    const spaces = await this.spacesService.deleteSpacesByTeamIds([
      teamToDelete.id,
    ]);

    if (!spaces) {
      throw new BadRequestException({
        error: { teamId },
      });
    }

    try {
      const result = await this.teamRepository.save(teamToDelete);
      return result;
    } catch (error) {
      throw new BadRequestException({
        error,
      });
    }
  }
}
