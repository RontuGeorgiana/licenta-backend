import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentsService } from 'src/comments/providers/comments.service';
import { Status } from 'src/common/enums/status.enum';
import { FoldersService } from 'src/folders/providers/folders.service';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/providers/users.service';
import { In, Repository } from 'typeorm';
import { CreateTaskDto } from '../dtos/create-task.dto';
import { EditTaskDto } from '../dtos/edit-task.dto';
import { TaskFilterDto } from '../dtos/task-filter.dto';
import { Task } from '../entities/task.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @Inject(forwardRef(() => FoldersService))
    private readonly foldersService: FoldersService,
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => CommentsService))
    private readonly commentsService: CommentsService,
  ) {}

  public async createTask(data: CreateTaskDto, user: User) {
    if (!data.folderId || !data.name) {
      throw new BadRequestException({
        error: { data },
      });
    }

    const folder = await this.foldersService.getFolderById(data.folderId);

    if (!folder) {
      throw new NotFoundException({
        error: { folderId: data.folderId },
      });
    }

    const teamId = await this.foldersService.getTeamByFolder(data.folderId);

    if (!user) {
      throw new ForbiddenException({
        error: { user },
      });
    }

    const userRole = await this.usersService.getUserRole(user.id, teamId);

    if (!userRole) {
      throw new ForbiddenException({
        error: { user: user.id, teamId },
      });
    }

    const task: Partial<Task> = {
      ...data,
    };

    try {
      const dbTask = await this.taskRepository.create(task);
      const result = await this.taskRepository.save(dbTask);
      let updateResult;
      if (result.parent) {
        updateResult = await this.addChild(result.parent, result.id);
      }
      if (!updateResult && result.parent) {
        throw new BadRequestException({
          error: { parent: result.parent },
        });
      }
      return result;
    } catch (error) {
      throw new BadRequestException({
        error,
      });
    }
  }

  public async getTaskById(taskId: number, user: User, teamId: number) {
    if (!taskId) {
      throw new BadRequestException({
        error: { taskId },
      });
    }

    if (!user) {
      throw new ForbiddenException({
        error: { user },
      });
    }

    const userRole = await this.usersService.getUserRole(user.id, teamId);

    if (!userRole) {
      throw new ForbiddenException({
        error: { user },
      });
    }

    try {
      let task = await this.taskRepository.findOne(taskId);
      const assignee = await this.usersService.getUserById(task.asignee, true);
      const subtasks = await this.getSubtasksByIds(task.children);
      const comments = await this.commentsService.getCommentsByTaskId(
        task.id,
        user.id,
        userRole,
      );
      const processedTask = {
        ...task,
        asignee: assignee
          ? {
              name: `${assignee.firstName} ${assignee.lastName}`,
              email: assignee.email,
            }
          : null,
        children: subtasks,
        comments,
      };
      return processedTask;
    } catch (error) {
      throw new NotFoundException({
        error,
      });
    }
  }

  public async getTasksByFolder(
    folderId: number,
    filters: TaskFilterDto,
    user: User,
  ) {
    if (!folderId) {
      throw new BadRequestException({
        error: { folderId },
      });
    }

    if (!user) {
      throw new ForbiddenException({
        error: { user },
      });
    }

    const query = this.taskRepository
      .createQueryBuilder('task')
      .select([
        'task.id',
        'task.asignee',
        'task.folderId',
        'task.name',
        'task.description',
        'task.dueDate',
        'task.priority AS priority',
        'task.status',
        'task.timeTracked',
        'task.estimation',
        'task.tags',
        'task.type',
        'task.parent',
        'task.children',
      ])
      .where(`task.folderId = ${folderId}`);

    if (filters?.assignee && filters?.assignee === 'me') {
      query.andWhere(`task.asignee = ${user.id}`);
    }

    if (filters?.priority) {
      query.andWhere(`(priority = ${filters.priority})`);
    }

    if (filters?.type) {
      query.andWhere(`task.type = '${filters.type}'`);
    }

    if (filters?.search) {
      query.andWhere(`task.name LIKE '%${filters.search}%'`);
    }

    try {
      let result = await query.getMany();
      const processedResults = await Promise.all(
        result.map(async (res): Promise<any> => {
          if (res.asignee !== null) {
            const assigneeData = await this.usersService.getUserById(
              res.asignee,
            );
            return {
              ...res,
              asignee: {
                name: `${assigneeData.firstName} ${assigneeData.lastName}`,
                email: assigneeData.email,
              },
            };
          }
          return res;
        }),
      );
      let taskTree: any = {};
      Object.keys(Status).forEach(async (key: any) => {
        taskTree[key] = await Promise.all(
          processedResults
            .filter(
              (task) =>
                this.taskRoot(task, processedResults) &&
                task.status === Status[key],
            )
            .map(async (task) => {
              console.log(await this.buildTaskTree(processedResults, task.id));
              return await this.buildTaskTree(processedResults, task.id);
            }),
        );
      });
      let teamId;
      if (taskTree) {
        teamId = await this.foldersService.getTeamByFolder(folderId);
      }
      return {
        taskTree,
        teamId,
      };
    } catch (error) {
      throw new BadRequestException({ error });
    }
  }

  public async editTaskById(data: EditTaskDto, user: User) {
    console.log(data);

    if (!data.taskId) {
      throw new BadRequestException({
        error: { taskId: data.taskId },
      });
    }

    if (!user) {
      throw new ForbiddenException({
        error: { user },
      });
    }

    let taskToEdit = await this.taskRepository.findOne(data.taskId);

    if (!taskToEdit) {
      throw new NotFoundException({
        error: { taskId: data.taskId },
      });
    }

    taskToEdit = {
      ...taskToEdit,
      name: data.name ? data.name : taskToEdit.name,
      description: data.description ? data.description : taskToEdit.description,
      asignee: data.asignee ? data.asignee : taskToEdit.asignee,
      dueDate: data.dueDate ? data.dueDate : taskToEdit.dueDate,
      priority: data.priority ? data.priority : taskToEdit.priority,
      status: data.status ? data.status : taskToEdit.status,
      timeTracked: data.timeTracked ? data.timeTracked : taskToEdit.timeTracked,
      tags: data.tags ? data.tags : taskToEdit.tags,
      estimation: data.estimation ? data.estimation : taskToEdit.estimation,
    };

    try {
      const result = await this.taskRepository.save(taskToEdit);
      return result;
    } catch (error) {
      throw new BadRequestException({
        error,
      });
    }
  }

  public async softDeleteTaskById(taskId: number, user: User) {
    if (!taskId) {
      throw new BadRequestException({
        error: { taskId },
      });
    }

    if (!user) {
      throw new BadRequestException({
        error: { user },
      });
    }

    let taskToDelete = await this.taskRepository.findOne(taskId);

    if (!taskToDelete) {
      throw new NotFoundException({
        error: { taskId },
      });
    }

    taskToDelete = {
      ...taskToDelete,
      deletedOn: new Date(),
    };

    try {
      const result = await this.taskRepository.save(taskToDelete);
      return result;
    } catch (error) {
      throw new BadRequestException({
        error,
      });
    }
  }

  public async softDeleteTasksByFolderIds(folderIds: number[]) {
    if (!folderIds || folderIds.length === 0) {
      throw new BadRequestException({
        error: {
          folderIds,
        },
      });
    }

    try {
      const result = this.taskRepository.update(
        { folderId: In(folderIds) },
        { deletedOn: new Date() },
      );
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

    let parent: Task = await this.taskRepository.findOne(parentId);

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
      const result = await this.taskRepository.save(parent);
      return result;
    } catch (error) {
      throw new BadRequestException({
        error,
      });
    }
  }

  private async getSubtasksByIds(taskIds: number[]) {
    if (!taskIds || taskIds.length === 0) {
      return null;
    }

    const query = this.taskRepository
      .createQueryBuilder('task')
      .select([
        'task.id',
        'task.name',
        'task.type',
        'task.asignee',
        'task.priority',
      ])
      .where(`task.id IN (${taskIds})`);

    try {
      const result = await query.getMany();
      return result;
    } catch (error) {
      throw new NotFoundException({
        error,
      });
    }
  }

  private async buildTaskTree(tasks: Task[], rootId?: number) {
    let newTreeRoot = tasks.find((task) => task.id === rootId);
    if (!newTreeRoot) {
      const lastChild = this.taskRepository.findOne(rootId);
      return lastChild;
    }
    let tree: any = {
      ...newTreeRoot,
      children: [],
    };
    if (newTreeRoot.children) {
      for (const child of newTreeRoot.children) {
        const childTree = await this.buildTaskTree(tasks, child);
        if (childTree !== null) {
          tree.children.push(childTree);
        }
      }
    }
    return tree;
  }

  private taskRoot(task: Task, tasks: Task[]) {
    if (task.parent === null) {
      return true;
    } else if (!tasks.find((parent) => parent.id === task.parent)) {
      return true;
    }
    return false;
  }
}
