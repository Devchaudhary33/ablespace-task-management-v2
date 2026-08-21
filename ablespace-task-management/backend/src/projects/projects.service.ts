import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectDocument } from './schemas/project.schema';
import { CreateProjectDto } from './dto/project.dto';

@Injectable()
export class ProjectsService {
  constructor(@InjectModel(Project.name) private readonly projects: Model<ProjectDocument>) {}

  findAll() {
    return this.projects.find()
      .populate('lead', 'name email avatar')
      .populate('members', 'name email avatar')
      .sort({ createdAt: -1 });
  }

  async findOne(id: string) {
    const project = await this.projects.findById(id)
      .populate('lead', 'name email avatar')
      .populate('members', 'name email avatar');
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  create(dto: CreateProjectDto) {
    return this.projects.create(dto);
  }

  async update(id: string, dto: Partial<CreateProjectDto>) {
    const project = await this.projects.findByIdAndUpdate(id, dto, { new: true, runValidators: true });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async remove(id: string) {
    const project = await this.projects.findByIdAndDelete(id);
    if (!project) throw new NotFoundException('Project not found');
    return { message: 'Project deleted' };
  }
}
