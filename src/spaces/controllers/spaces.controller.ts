import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-strategy/jwt-auth.guard';
import { UserParam } from 'src/common/decorators/user.decorator';
import { User } from 'src/users/entities/user.entity';
import { DeleteResult } from 'typeorm';
import { CreateSpaceDto } from '../dtos/create-space.dto';
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
  ): Promise<DeleteResult> {
    return await this.spacesService.deleteSpaceById(spaceId, user);
  }
}
