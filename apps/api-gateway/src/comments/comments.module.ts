import { Module } from '@nestjs/common';
import { CommentsController, CommentsStandaloneController } from './comments.controller';
import { CommentsService } from './comments.service';

@Module({
  imports: [],
  controllers: [CommentsController, CommentsStandaloneController],
  providers: [CommentsService],
})
export class CommentsModule {}