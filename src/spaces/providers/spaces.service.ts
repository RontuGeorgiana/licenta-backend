import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/common/enums/role.enum';
import { TeamsService } from 'src/teams/providers/teams.service';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/providers/users.service';
import { DeleteResult, Repository } from 'typeorm';
import { CreateSpaceDto } from '../dtos/create-space.dto';
import { Space } from '../entities/space.entity';

@Injectable()
export class SpacesService {
  constructor(
    @InjectRepository(Space)
    private readonly spaceRepository: Repository<Space>,
    private readonly usersService: UsersService,
    private readonly teamsService: TeamsService,
  ) {}

  public async createSpace(data: CreateSpaceDto, operator: User) {
    if (!operator) {
      throw new BadRequestException({
        error: { operator },
      });
    }
    const operatorRole = await this.usersService.getUserRole(
      operator.id,
      data.teamId,
    );

    if (![Role.Owner.valueOf(), Role.Admin.valueOf()].includes(operatorRole)) {
      throw new ForbiddenException({
        error: { operatorRole },
      });
    }

    const team = await this.teamsService.getTeamById(data.teamId);
    if (!team) {
      throw new NotFoundException({
        error: {
          teamId: data.teamId,
        },
      });
    }

    const newSpace: Partial<Space> = data;

    try {
      const dbSpace = await this.spaceRepository.create(newSpace);
      const result = await this.spaceRepository.save(dbSpace);
      return result;
    } catch {
      throw new BadRequestException({
        error: { message: `Space couldn't be created` },
      });
    }
  }

  public async getSpaceById(spaceId: number): Promise<Space> {
    if (!spaceId) {
      throw new BadRequestException({
        error: { spaceId },
      });
    }

    const space = this.spaceRepository.findOne(spaceId);

    if (!space) {
      throw new NotFoundException({
        error: { spaceId },
      });
    }

    return space;
  }

  public async deleteSpaceById(
    spaceId: number,
    operator: User,
  ): Promise<DeleteResult> {
    if (!operator) {
      throw new UnauthorizedException({
        error: { operator },
      });
    }

    if (!spaceId) {
      throw new BadRequestException({
        error: { spaceId },
      });
    }

    const spaceToDelete = await this.spaceRepository.findOne(spaceId);

    if (!spaceToDelete) {
      throw new NotFoundException({
        error: { spaceId },
      });
    }

    const operatorRole = await this.usersService.getUserRole(
      operator.id,
      spaceToDelete.teamId,
    );

    if (
      ![Role.Admin.valueOf() && Role.Owner.valueOf()].includes(operatorRole)
    ) {
      throw new UnauthorizedException({
        error: { operatorRole },
      });
    }

    try {
      const result = await this.spaceRepository.delete(spaceId);
      return result;
    } catch (error) {
      throw new BadRequestException({
        error,
      });
    }
  }
}
