import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import { CreateTaskDto } from '../dtos/create-task.dto';
import { EditTaskDto } from '../dtos/edit-task.dto';
import { TaskFilterDto } from '../dtos/task-filter.dto';
import { Task } from '../entities/task.entity';
import { TasksService } from '../providers/tasks.service';

@UseFilters(BaseExceptionFilter)
@ApiTags('tasks')
@ApiBearerAuth()
@Controller({ path: '/tasks' })
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/create')
  async createTask(
    @Body() createTaskDto: CreateTaskDto,
    @UserParam() user: User,
  ): Promise<Task> {
    return await this.tasksService.createTask(createTaskDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getTaskById(
    @Param('id') id: number,
    @Query('teamId') teamId: number,
    @UserParam() user: User,
  ) {
    return await this.tasksService.getTaskById(id, user, teamId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getTasksByFolder(
    @Query('folderId') folderId: number,
    @Query() filters: TaskFilterDto,
    @UserParam() user: User,
  ) {
    return await this.tasksService.getTasksByFolder(folderId, filters, user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  async editTaskById(
    @Body() data: EditTaskDto,
    @UserParam() user: User,
  ): Promise<Task> {
    return await this.tasksService.editTaskById(data, user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  async softDeleteTask(
    @Query('taskId') taskId: number,
    @UserParam() user: User,
  ) {
    await this.tasksService.softDeleteTaskById(taskId, user);
  }
}
