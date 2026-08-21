import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Team, TeamDocument } from './schemas/team.schema';

@Injectable()
export class TeamsService {
  constructor(@InjectModel(Team.name) private readonly teams: Model<TeamDocument>) {}
  findAll() { return this.teams.find().populate('lead', 'name email avatar').populate('members', 'name email avatar'); }
  async create(data: Partial<Team>) { return this.teams.create(data); }
  async update(id: string, data: Partial<Team>) {
    const team = await this.teams.findByIdAndUpdate(id, data, { new: true });
    if (!team) throw new NotFoundException('Team not found');
    return team;
  }
  async remove(id: string) {
    const team = await this.teams.findByIdAndDelete(id);
    if (!team) throw new NotFoundException('Team not found');
    return { message: 'Team deleted' };
  }
}
