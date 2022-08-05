import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembershipsModule } from 'src/memberships/memberships.module';
import { SpacesModule } from 'src/spaces/spaces.module';
import { UsersModule } from 'src/users/users.module';
import { TeamsController } from './controllers/teams.controller';
import { Team } from './entities/team.entity';
import { TeamsService } from './providers/teams.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Team]),
    forwardRef(() => MembershipsModule),
    UsersModule,
    forwardRef(() => SpacesModule),
  ],
  controllers: [TeamsController],
  providers: [TeamsService],
  exports: [TeamsService],
})
export class TeamsModule {}
