import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateProjectDto } from './dto/project.dto';

@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}
  @Get() findAll() { return this.projects.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.projects.findOne(id); }
  @Post() create(@Body() dto: CreateProjectDto) { return this.projects.create(dto); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: Partial<CreateProjectDto>) { return this.projects.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.projects.remove(id); }
}
