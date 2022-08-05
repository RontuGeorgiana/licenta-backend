import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-strategy/jwt-auth.guard';
import { UserParam } from 'src/common/decorators/user.decorator';
import { User } from 'src/users/entities/user.entity';
import { CreateFolderDto } from '../dtos/create-folder.dto';
import { EditFolderDto } from '../dtos/edit-folder.dto';
import { Folder } from '../entities/folder.entity';
import { FoldersService } from '../providers/folders.service';

@UseFilters(BaseExceptionFilter)
@ApiTags('folders')
@ApiBearerAuth()
@Controller({ path: 'folders' })
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/create')
  async createFolder(
    @UserParam() user: User,
    @Body() createFolderDto: CreateFolderDto,
  ): Promise<Folder> {
    return await this.foldersService.createFolder(createFolderDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/team')
  async getTeamByFolder(@Query('folderId') folderId: number) {
    await this.foldersService.getTeamByFolder(folderId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getFoldersBySpace(
    @Query('spaceId') spaceId: number,
  ): Promise<Folder[]> {
    return await this.foldersService.getFoldersBySpace(spaceId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  async editFolderById(
    @Body() editFoldeDto: EditFolderDto,
    @UserParam() user: User,
  ) {
    await this.foldersService.editFolderById(editFoldeDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  async softDeleteFolder(
    @Query('folderId') folderId: number,
    @UserParam() user: User,
  ) {
    await this.softDeleteFolder(folderId, user);
  }
}
