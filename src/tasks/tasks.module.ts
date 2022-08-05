import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FoldersModule } from 'src/folders/folders.module';
import { UsersModule } from 'src/users/users.module';
import { TasksController } from './controllers/tasks.controller';
import { Task } from './entities/task.entity';
import { TasksService } from './providers/tasks.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task]),
    forwardRef(() => FoldersModule),
    UsersModule,
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
