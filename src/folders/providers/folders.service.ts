import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/common/enums/role.enum';
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
      const dbFolder = this.folderRepository.create(folder);
      const result = this.folderRepository.save(dbFolder);
      return result;
    } catch (error) {
      throw new BadRequestException({
        error,
      });
    }
  }
}
