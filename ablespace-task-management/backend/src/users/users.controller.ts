import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}
  @Get() findAll() { return this.users.findAll(); }
  @Patch(':id') update(@Param('id') id: string, @Body() data: Record<string, unknown>) { return this.users.update(id, data); }
}
