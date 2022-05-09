import { Body, Controller, Post, UseFilters } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserParam } from 'src/common/decorators/user.decorator';
import { User } from 'src/users/entities/user.entity';
import { CreateFolderDto } from '../dtos/create-folder.dto';
import { Folder } from '../entities/folder.entity';
import { FoldersService } from '../providers/folders.service';

@UseFilters(BaseExceptionFilter)
@ApiTags('folders')
@ApiBearerAuth()
@Controller({ path: 'folders' })
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Post('/create')
  async createFolder(
    @UserParam() user: User,
    @Body() createFolderDto: CreateFolderDto,
  ): Promise<Folder> {
    return await this.foldersService.createFolder(createFolderDto, user);
  }
}
