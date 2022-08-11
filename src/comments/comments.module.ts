import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksModule } from 'src/tasks/tasks.module';
import { UsersModule } from 'src/users/users.module';
import { CommentsController } from './controllers/comments.controller';
import { Comment } from './entities/comment.entity';
import { CommentsService } from './providers/comments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment]),
    forwardRef(() => TasksModule),
    UsersModule,
  ],
  providers: [CommentsService],
  controllers: [CommentsController],
  exports: [CommentsService],
})
export class CommentsModule {}
