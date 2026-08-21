import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Get()
  findAll(@Query() query: Record<string, string | undefined>) { return this.tasks.findAll(query); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.tasks.findOne(id); }

  @Post()
  create(@Body() dto: CreateTaskDto, @CurrentUser() user: { sub: string }) { return this.tasks.create(dto, user.sub); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto) { return this.tasks.update(id, dto); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.tasks.remove(id); }
}
