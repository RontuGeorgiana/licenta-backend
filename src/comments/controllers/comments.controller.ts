import {
  Body,
  Controller,
  Delete,
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
import { CreateCommentDto } from '../dtos/create-comment.dto';
import { CommentsService } from '../providers/comments.service';

@UseFilters(BaseExceptionFilter)
@ApiTags('comments')
@ApiBearerAuth()
@Controller({ path: '/comments' })
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createComment(@Body() data: CreateCommentDto, @UserParam() user: User) {
    return this.commentsService.createComment(data, user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  async deleteComment(
    @Query('id') id: number,
    @UserParam() user: User,
    @Query('teamId') teamId: number,
  ) {
    return this.commentsService.deleteCommentById(id, teamId, user);
  }
}
