import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../auth/schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly users: Model<UserDocument>) {}
  async findAll() { return this.users.find().select('-passwordHash').sort({ name: 1 }); }
  async update(id: string, data: Partial<User>) {
    const user = await this.users.findByIdAndUpdate(id, data, { new: true }).select('-passwordHash');
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
