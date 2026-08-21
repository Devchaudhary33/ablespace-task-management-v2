import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from './schemas/comment.schema';

@Injectable()
export class CommentsService {
  constructor(@InjectModel(Comment.name) private readonly comments: Model<CommentDocument>) {}

  findByTask(taskId: string) {
    return this.comments.find({ task: taskId })
      .populate('author', 'name avatar')
      .sort({ createdAt: 1 });
  }

  create(taskId: string, author: string, content: string) {
    return this.comments.create({ task: taskId, author, content });
  }

  async remove(id: string, userId: string) {
    const comment = await this.comments.findById(id);
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.author.toString() !== userId) throw new ForbiddenException('You can only delete your own comments');
    await comment.deleteOne();
    return { message: 'Comment deleted' };
  }
}
