import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CommentsModule } from './comments/comments.module';
import { CommonModule } from './common/common.module';
import { TypeOrmConfigService } from './common/providers/TypeOrmConfigService.service';
import { EventsModule } from './events/events.module';
import { FoldersModule } from './folders/folders.module';
import { MembershipsModule } from './memberships/memberships.module';
import { SpacesModule } from './spaces/spaces.module';
import { TasksModule } from './tasks/tasks.module';
import { TeamsModule } from './teams/teams.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: TypeOrmConfigService,
    }),
    ConfigModule.forRoot(),
    CommonModule,
    UsersModule,
    TeamsModule,
    MembershipsModule,
    SpacesModule,
    FoldersModule,
    AuthModule,
    TasksModule,
    CommentsModule,
    EventsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
