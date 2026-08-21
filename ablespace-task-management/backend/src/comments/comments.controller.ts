import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { IsString, MinLength } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { CommentsService } from './comments.service';

class CreateCommentDto {
  @IsString()
  @MinLength(1)
  content!: string;
}

@UseGuards(JwtAuthGuard)
@Controller('tasks/:taskId/comments')
export class CommentsController {
  constructor(private readonly comments: CommentsService) {}

  @Get()
  find(@Param('taskId') taskId: string) { return this.comments.findByTask(taskId); }

  @Post()
  create(@Param('taskId') taskId: string, @Body() dto: CreateCommentDto, @CurrentUser() user: { sub: string }) {
    return this.comments.create(taskId, user.sub, dto.content);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: { sub: string }) {
    return this.comments.remove(id, user.sub);
  }
}
