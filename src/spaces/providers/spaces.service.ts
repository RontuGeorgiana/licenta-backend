import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/common/enums/role.enum';
import { FoldersService } from 'src/folders/providers/folders.service';
import { TeamsService } from 'src/teams/providers/teams.service';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/providers/users.service';
import { In, Repository } from 'typeorm';
import { CreateSpaceDto } from '../dtos/create-space.dto';
import { EditSpaceDto } from '../dtos/edit-space.dto';
import { Space } from '../entities/space.entity';

@Injectable()
export class SpacesService {
  constructor(
    @InjectRepository(Space)
    private readonly spaceRepository: Repository<Space>,
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => TeamsService))
    private readonly teamsService: TeamsService,
    @Inject(forwardRef(() => FoldersService))
    private readonly foldersService: FoldersService,
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

  public async softDeleteSpaceById(
    spaceId: number,
    operator: User,
  ): Promise<Space> {
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

    let spaceToDelete = await this.spaceRepository.findOne(spaceId);

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

    spaceToDelete = {
      ...spaceToDelete,
      deletedOn: new Date(),
    };

    const folders = this.foldersService.deleteFoldersBySpacesIds([
      spaceToDelete.id,
    ]);

    if (!folders) {
      throw new BadRequestException({
        error: { folders },
      });
    }

    try {
      const result = await this.spaceRepository.save(spaceToDelete);
      return result;
    } catch (error) {
      throw new BadRequestException({
        error,
      });
    }
  }

  public async deleteSpacesByTeamIds(teamIds: number[]) {
    if (!teamIds || teamIds.length === 0) {
      throw new BadRequestException({
        error: { teamIds },
      });
    }

    let spaces = await this.spaceRepository
      .createQueryBuilder('space')
      .select('space.id as id')
      .where(`space.teamId IN (${teamIds})`)
      .execute();

    if (!spaces && spaces?.length !== 0) {
      throw new NotFoundException({ error: { teamIds } });
    }

    if (spaces?.length !== 0) {
      spaces = spaces.map((space) => space.id);

      const folders = await this.foldersService.deleteFoldersBySpacesIds(
        spaces,
      );

      if (!folders) {
        throw new BadRequestException({
          error: {
            spaces,
          },
        });
      }
    }

    try {
      const result = await this.spaceRepository.update(
        { teamId: In(teamIds) },
        { deletedOn: new Date() },
      );
      return result;
    } catch (error) {
      throw new BadRequestException({ error });
    }
  }

  public async editSpaceById(data: EditSpaceDto, user: User): Promise<Space> {
    if (!data.spaceId) {
      throw new BadRequestException({
        error: {
          id: data.spaceId,
        },
      });
    }

    let spaceToUpdate = await this.spaceRepository.findOne(data.spaceId);

    if (!spaceToUpdate) {
      throw new NotFoundException({
        error: {
          id: data.spaceId,
        },
      });
    }

    const userRole = await this.usersService.getUserRole(
      user.id,
      spaceToUpdate.teamId,
    );

    if (![Role.Admin.valueOf(), Role.Owner.valueOf()].includes(userRole)) {
      throw new ForbiddenException({
        error: {
          userRole,
        },
      });
    }

    spaceToUpdate = {
      ...spaceToUpdate,
      name: data.name,
    };

    try {
      const result = await this.spaceRepository.save(spaceToUpdate);
      return result;
    } catch (error) {
      throw new BadRequestException({
        error,
      });
    }
  }

  public async getTeamBySpace(spaceId: number): Promise<number> {
    if (!spaceId) {
      throw new BadRequestException({
        error: { spaceId },
      });
    }

    const space = await this.spaceRepository.findOne(spaceId);

    if (!space) {
      throw new NotFoundException({
        error: { spaceId },
      });
    }

    return space.teamId;
  }
}
