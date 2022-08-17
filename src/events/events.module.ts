import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { EventsController } from './controllers/events.controller';
import { Event } from './entities/event.entity';
import { EventsService } from './providers/events.service';

@Module({
  imports: [TypeOrmModule.forFeature([Event]), UsersModule],
  providers: [EventsService],
  controllers: [EventsController],
  exports: [EventsService],
})
export class EventsModule {}
