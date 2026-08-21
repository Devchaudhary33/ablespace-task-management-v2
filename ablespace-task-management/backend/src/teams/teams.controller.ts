import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TeamsService } from './teams.service';

@UseGuards(JwtAuthGuard)
@Controller('teams')
export class TeamsController {
  constructor(private readonly teams: TeamsService) {}
  @Get() findAll() { return this.teams.findAll(); }
  @Post() create(@Body() data: Partial<{ name: string; description: string }>) { return this.teams.create(data); }
  @Patch(':id') update(@Param('id') id: string, @Body() data: Record<string, unknown>) { return this.teams.update(id, data); }
  @Delete(':id') remove(@Param('id') id: string) { return this.teams.remove(id); }
}
