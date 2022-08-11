import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsModule } from 'src/comments/comments.module';
import { FoldersModule } from 'src/folders/folders.module';
import { UsersModule } from 'src/users/users.module';
import { TasksController } from './controllers/tasks.controller';
import { Task } from './entities/task.entity';
import { TasksService } from './providers/tasks.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task]),
    forwardRef(() => FoldersModule),
    forwardRef(() => CommentsModule),
    UsersModule,
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
