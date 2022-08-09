import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/common/enums/role.enum';
import { SpacesService } from 'src/spaces/providers/spaces.service';
import { TasksService } from 'src/tasks/providers/tasks.service';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/providers/users.service';
import { In, Repository } from 'typeorm';
import { CreateFolderDto } from '../dtos/create-folder.dto';
import { EditFolderDto } from '../dtos/edit-folder.dto';
import { Folder } from '../entities/folder.entity';

export class FoldersService {
  constructor(
    @InjectRepository(Folder)
    private readonly folderRepository: Repository<Folder>,
    private readonly userService: UsersService,
    @Inject(forwardRef(() => SpacesService))
    private readonly spacesService: SpacesService,
    @Inject(forwardRef(() => TasksService))
    private readonly tasksService: TasksService,
  ) {}

  public async createFolder(data: CreateFolderDto, operator: User) {
    if (!operator) {
      throw new ForbiddenException({
        error: { operator },
      });
    }

    const operatorRole = await this.userService.getUserRole(
      operator.id,
      data.teamId,
    );

    if (![Role.Admin.valueOf(), Role.Owner.valueOf()].includes(operatorRole)) {
      throw new ForbiddenException({
        error: {
          operatorRole,
        },
      });
    }

    const folder: Partial<Folder> = {
      name: data.name,
      spaceId: data.spaceId,
      parent: data.parentId,
    };

    try {
      const dbFolder = await this.folderRepository.create(folder);
      const result = await this.folderRepository.save(dbFolder);
      let updateResult;
      if (result.parent) {
        try {
          updateResult = await this.addChild(result.parent, result.id);
        } catch (error) {
          throw new BadRequestException({
            error,
          });
        }
      }
      if (!updateResult && result.parent) {
        throw new BadRequestException({
          error: { parent: result.parent, child: result.id },
        });
      }
      return result;
    } catch (error) {
      throw new BadRequestException({
        error,
      });
    }
  }

  public async getFolderById(folderId): Promise<Folder> {
    if (!folderId) {
      throw new BadRequestException({
        error: { folderId },
      });
    }

    try {
      const result = await this.folderRepository.findOne(folderId);
      return result;
    } catch (error) {
      throw new NotFoundException({
        error,
      });
    }
  }

  public async getFoldersBySpace(spaceId: number) {
    if (!spaceId) {
      throw new BadRequestException({
        error: { spaceId },
      });
    }

    const space = await this.spacesService.getSpaceById(spaceId);

    if (!space) {
      throw new NotFoundException({
        error: { spaceId },
      });
    }

    const query = this.folderRepository
      .createQueryBuilder('folder')
      .select(['folder.id', 'folder.name', 'folder.parent', 'folder.children'])
      .where(`folder.spaceId = ${spaceId}`);

    try {
      const result = await query.getMany();
      let folderTree: any = result
        .filter((folder) => folder.parent === null)
        .map((folder) => this.buildFolderTree(result, folder.id));
      return { folderTree, teamId: space.teamId };
    } catch (error) {
      throw new BadRequestException({
        error,
      });
    }
  }

  public async editFolderById(data: EditFolderDto, user: User) {
    if (!data.id) {
      throw new BadRequestException({
        error: { id: data.id },
      });
    }

    let folderToEdit = await this.folderRepository.findOne(data.id);

    if (!folderToEdit) {
      throw new NotFoundException({
        error: { id: data.id },
      });
    }

    if (!user) {
      throw new ForbiddenException({
        error: { user },
      });
    }

    const teamId = await this.spacesService.getTeamBySpace(
      folderToEdit.spaceId,
    );
    const userRole = await this.userService.getUserRole(user.id, teamId);

    if (![Role.Admin.valueOf(), Role.Owner.valueOf()].includes(userRole)) {
      throw new ForbiddenException({
        error: { userRole },
      });
    }

    if (data.name && data.name !== '') {
      folderToEdit = {
        ...folderToEdit,
        name: data.name,
      };
    }

    if (data.newParentId && data.newParentId !== null) {
      const parentData: EditFolderDto = {
        id: folderToEdit.parent,
        removeChild: folderToEdit.id,
        name: '',
        newParentId: null,
      };
      const parentResult = await this.editFolderById(parentData, user);
      if (!parentResult) {
        throw new BadRequestException({
          error: { parentData },
        });
      }

      folderToEdit = {
        ...folderToEdit,
        parent: data.newParentId === -1 ? null : data.newParentId,
      };
    }

    if (data.removeChild) {
      folderToEdit = {
        ...folderToEdit,
        children: folderToEdit.children.filter(
          (child) => child !== data.removeChild,
        ),
      };
    }

    try {
      const result = await this.folderRepository.save(folderToEdit);
      return result;
    } catch (error) {
      throw new BadRequestException({
        error,
      });
    }
  }

  public async deleteFloder(folderId: number, user: User) {
    if (!folderId) {
      throw new BadRequestException({
        error: { folderId },
      });
    }

    let folderToDelete: Folder = await this.folderRepository.findOne(folderId);

    if (!folderToDelete) {
      throw new NotFoundException({
        error: { folderId },
      });
    }

    if (!user) {
      throw new ForbiddenException({
        error: { user },
      });
    }

    const userRole = await this.userService.getUserRole(
      user.id,
      await this.getTeamByFolder(folderId),
    );

    if (![Role.Admin.valueOf(), Role.Owner.valueOf()].includes(userRole)) {
      throw new ForbiddenException({
        error: { userRole },
      });
    }

    folderToDelete = { ...folderToDelete, deletedOn: new Date() };

    const tasks = this.tasksService.softDeleteTasksByFolderIds([folderId]);

    if (!tasks) {
      throw new BadRequestException({
        error: {
          folderId,
        },
      });
    }

    try {
      const result = await this.folderRepository.save(folderToDelete);
      return result;
    } catch (error) {
      throw new BadRequestException({
        error,
      });
    }
  }

  private async addChild(parentId: number, childId: number) {
    if (!parentId) {
      throw new BadRequestException({
        error: { parentId },
      });
    }

    let parent: Folder = await this.folderRepository.findOne(parentId);

    if (!parent) {
      throw new NotFoundException({
        error: { parentId },
      });
    }

    if (parent.children) {
      parent.children.push(childId);
    } else {
      parent.children = [childId];
    }
    try {
      const result = await this.folderRepository.save(parent);
      return result;
    } catch (error) {
      throw new BadRequestException({
        error,
      });
    }
  }

  public async deleteFoldersBySpacesIds(spacesIds: number[]) {
    if (!spacesIds || spacesIds.length === 0) {
      throw new BadRequestException({
        error: { spacesIds },
      });
    }

    let folders = await this.folderRepository
      .createQueryBuilder('folder')
      .select('folder.id as id')
      .where(`folder.spaceId IN (${spacesIds})`)
      .execute();

    if (!folders && folders?.length !== 0) {
      throw new NotFoundException({
        error: { spacesIds },
      });
    }

    if (folders?.length !== 0) {
      folders = folders.map((folder) => folder.id);

      const tasks = await this.tasksService.softDeleteTasksByFolderIds(folders);

      if (!tasks) {
        throw new BadRequestException({
          error: { folders },
        });
      }
    }

    try {
      const result = this.folderRepository.update(
        { spaceId: In(spacesIds) },
        { deletedOn: new Date() },
      );
      return result;
    } catch (error) {
      throw new BadRequestException({
        error,
      });
    }
  }

  private buildFolderTree(folders: Folder[], rootId?: number) {
    const newTreeRoot = folders.find((folder) => folder.id === rootId);
    let tree: any = {
      ...newTreeRoot,
      children: [],
    };

    if (newTreeRoot.children) {
      for (const child of newTreeRoot.children) {
        tree.children.push(this.buildFolderTree(folders, child));
      }
    }
    return tree;
  }

  public async getTeamByFolder(folderId): Promise<number> {
    if (!folderId) {
      throw new BadRequestException({
        error: { folderId },
      });
    }

    const folder = await this.folderRepository.findOne(folderId);

    if (!folder) {
      throw new NotFoundException({
        error: { folderId },
      });
    }

    return await this.spacesService.getTeamBySpace(folder.spaceId);
  }
}
