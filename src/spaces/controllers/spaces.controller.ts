import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-strategy/jwt-auth.guard';
import { UserParam } from 'src/common/decorators/user.decorator';
import { User } from 'src/users/entities/user.entity';
import { CreateSpaceDto } from '../dtos/create-space.dto';
import { EditSpaceDto } from '../dtos/edit-space.dto';
import { Space } from '../entities/space.entity';
import { SpacesService } from '../providers/spaces.service';

@UseFilters(BaseExceptionFilter)
@ApiTags('spaces')
@ApiBearerAuth()
@Controller({ path: 'spaces' })
export class SpacesController {
  constructor(private readonly spacesService: SpacesService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/create')
  async createSpace(
    @UserParam() user: User,
    @Body() createSpaceDto: CreateSpaceDto,
  ): Promise<Space> {
    return await this.spacesService.createSpace(createSpaceDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/delete')
  async deleteSpace(
    @UserParam() user: User,
    @Param('id') spaceId: number,
  ): Promise<Space> {
    return await this.spacesService.softDeleteSpaceById(spaceId, user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/update')
  async updateSpace(
    @UserParam() user: User,
    @Body() updateSpaceDto: EditSpaceDto,
  ): Promise<Space> {
    return await this.spacesService.editSpaceById(updateSpaceDto, user);
  }
}
