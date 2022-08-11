import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/common/enums/role.enum';
import { TasksService } from 'src/tasks/providers/tasks.service';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/providers/users.service';
import { Repository } from 'typeorm';
import { CreateCommentDto } from '../dtos/create-comment.dto';
import { Comment } from '../entities/comment.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @Inject(forwardRef(() => TasksService))
    private readonly tasksService: TasksService,
    private readonly usersService: UsersService,
  ) {}

  public async createComment(data: CreateCommentDto, user: User) {
    if (!user) {
      throw new ForbiddenException({
        error: {
          message: 'User must be authenticated',
        },
      });
    }

    if (!data.taskId) {
      throw new BadRequestException({
        error: {
          message: 'Invalid task id',
        },
      });
    }

    const comment: Partial<Comment> = {
      text: data.text,
      taskId: data.taskId,
      userId: user.id,
    };

    try {
      const dbComment = this.commentRepository.create(comment);
      const res = this.commentRepository.save(dbComment);

      return res;
    } catch (error) {
      throw new BadRequestException({
        error,
      });
    }
  }

  public async getCommentsByTaskId(
    taskId: number,
    userId: number,
    userRole: Role,
  ) {
    if (!taskId) {
      throw new BadRequestException({
        error: {
          message: 'Invalid task id',
        },
      });
    }
    const querry = this.commentRepository
      .createQueryBuilder('comment')
      .select([
        'comment.id',
        'comment.createdOn',
        'comment.text',
        'user.firstName',
        'user.lastName',
      ])
      .leftJoin('comment.user', 'user')
      .where(`comment.taskId = ${taskId}`);

    try {
      const result = await querry.getMany();
      return this.processComments(result, userId, userRole);
    } catch (error) {
      throw new BadRequestException({
        error,
      });
    }
  }

  //TODO delete comment by id
  public async deleteCommentById(id: number, teamId: number, user: User) {
    if (!id) {
      throw new BadRequestException({
        error: { message: 'Invalid comment id' },
      });
    }

    if (!user) {
      throw new ForbiddenException({
        error: {
          message: 'User must be authenticated',
        },
      });
    }

    const commentToDelete = await this.commentRepository.findOne(id);

    if (!commentToDelete) {
      throw new NotFoundException({
        error: { message: 'Comment not found' },
      });
    }

    const userRole = await this.usersService.getUserRole(user.id, teamId);

    if (
      ![Role.Admin, Role.Owner].includes(userRole) &&
      commentToDelete.userId !== user.id
    ) {
      throw new ForbiddenException({
        error: {
          message: 'Only admins, owners and the poster can remove comments!',
        },
      });
    }

    try {
      const result = this.commentRepository.delete(commentToDelete);
      return result;
    } catch (error) {
      throw new BadRequestException({
        error,
      });
    }
  }

  private processComments = (
    comments: Comment[],
    userId: number,
    userRole: Role,
  ) => {
    const processedComments = comments.map((comment) => ({
      ...comment,
      deletable:
        comment.userId === userId ||
        [Role.Admin, Role.Owner].includes(userRole),
    }));

    return processedComments;
  };
}
