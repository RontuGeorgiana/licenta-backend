import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from 'src/users/providers/users.service';
import { Folder } from './entities/folder.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Folder]), UsersService],
  providers: [],
  controllers: [],
  exports: [],
})
export class FoldersModule {}
