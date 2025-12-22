import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommentsController, CommentsStandaloneController } from './comments.controller';
import { CommentsService } from './comments.service';
import { Comment } from '../entities/comment.entity';
import { Task } from '../entities/task.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, Task]),
  ],
  controllers: [CommentsController, CommentsStandaloneController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}