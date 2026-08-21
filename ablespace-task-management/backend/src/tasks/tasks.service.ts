import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Task, TaskDocument } from './schemas/task.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(@InjectModel(Task.name) private readonly tasks: Model<TaskDocument>) {}

  findAll(query: Record<string, string | undefined>) {
    const filter: FilterQuery<TaskDocument> = {};
    if (query.status) filter.status = query.status;
    if (query.priority) filter.priority = query.priority;
    if (query.assignee) filter.assignee = query.assignee;
    if (query.project) filter.project = query.project;
    if (query.search) filter.$text = { $search: query.search };
    return this.tasks.find(filter)
      .populate('assignee', 'name email avatar')
      .populate('project', 'name')
      .populate('reporter', 'name email avatar')
      .sort({ createdAt: -1 });
  }

  async findOne(id: string) {
    const task = await this.tasks.findById(id)
      .populate('assignee', 'name email avatar')
      .populate('project', 'name')
      .populate('reporter', 'name email avatar');
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  create(dto: CreateTaskDto, userId: string) {
    return this.tasks.create({ ...dto, reporter: userId });
  }

  async update(id: string, dto: UpdateTaskDto) {
    const task = await this.tasks.findByIdAndUpdate(id, dto, { new: true, runValidators: true });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async remove(id: string) {
    const task = await this.tasks.findByIdAndDelete(id);
    if (!task) throw new NotFoundException('Task not found');
    return { message: 'Task deleted' };
  }
}
