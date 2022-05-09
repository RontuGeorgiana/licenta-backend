import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { FoldersController } from './controllers/folders.controller';
import { Folder } from './entities/folder.entity';
import { FoldersService } from './providers/folders.service';

@Module({
  imports: [TypeOrmModule.forFeature([Folder]), UsersModule],
  providers: [FoldersService],
  controllers: [FoldersController],
  exports: [],
})
export class FoldersModule {}
