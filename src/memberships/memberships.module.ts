import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsModule } from 'src/events/events.module';
import { TeamsModule } from 'src/teams/teams.module';
import { UsersModule } from 'src/users/users.module';
import { MembershipsController } from './controllers/memberships.controller';
import { Membership } from './entities/membership.entity';
import { MembershipsService } from './providers/memberships.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Membership]),
    forwardRef(() => TeamsModule),
    UsersModule,
    EventsModule,
  ],
  controllers: [MembershipsController],
  providers: [MembershipsService],
  exports: [MembershipsService],
})
export class MembershipsModule {}
