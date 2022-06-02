import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/common/enums/role.enum';
import { SpacesService } from 'src/spaces/providers/spaces.service';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/providers/users.service';
import { Repository } from 'typeorm';
import { CreateFolderDto } from '../dtos/create-folder.dto';
import { Folder } from '../entities/folder.entity';

export class FoldersService {
  constructor(
    @InjectRepository(Folder)
    private readonly folderRepository: Repository<Folder>,
    private readonly userService: UsersService,
    private readonly spacesService: SpacesService,
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

  public async getFoldersBySpace(spaceId: number): Promise<Folder[]> {
    if (!spaceId) {
      throw new BadRequestException({
        error: { spaceId },
      });
    }

    const space = this.spacesService.getSpaceById(spaceId);

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
      return folderTree;
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
}
