import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamsModule } from 'src/teams/teams.module';
import { UsersModule } from 'src/users/users.module';
import { SpacesController } from './controllers/spaces.controller';
import { Space } from './entities/space.entity';
import { SpacesService } from './providers/spaces.service';

@Module({
  imports: [TypeOrmModule.forFeature([Space]), UsersModule, TeamsModule],
  providers: [SpacesService],
  controllers: [SpacesController],
  exports: [SpacesService],
})
export class SpacesModule {}
