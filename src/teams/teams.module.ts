import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembershipsModule } from 'src/memberships/memberships.module';
import { TeamsController } from './controllers/teams.controller';
import { Team } from './entities/team.entity';
import { TeamsService } from './providers/teams.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Team]),
    forwardRef(() => MembershipsModule),
  ],
  controllers: [TeamsController],
  providers: [TeamsService],
  exports: [TeamsService],
})
export class TeamsModule {}
