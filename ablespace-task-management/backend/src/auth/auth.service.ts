import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly users: Model<UserDocument>,
    private readonly jwt: JwtService,
  ) {}

  private token(user: UserDocument) {
    return this.jwt.sign({ sub: user._id.toString(), email: user.email, name: user.name, role: user.role });
  }

  private safe(user: UserDocument) {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      title: user.title,
      avatar: user.avatar,
      role: user.role,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.users.findOne({ email: dto.email.toLowerCase() });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return { accessToken: this.token(user), user: this.safe(user) };
  }

  async guest() {
    let user = await this.users.findOne({ email: 'demo@ablespace.dev' });
    if (!user) {
      user = await this.users.create({
        name: 'Demo User',
        email: 'demo@ablespace.dev',
        passwordHash: await bcrypt.hash('Demo@12345', 12),
        title: 'Product Designer',
        role: 'admin',
      });
    }
    return { accessToken: this.token(user), user: this.safe(user) };
  }

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase();
    if (await this.users.exists({ email })) throw new ConflictException('Email already registered');

    const user = await this.users.create({
      name: dto.name,
      email,
      passwordHash: await bcrypt.hash(dto.password, 12),
    });
    return { accessToken: this.token(user), user: this.safe(user) };
  }

  async me(id: string) {
    const user = await this.users.findById(id);
    if (!user) throw new UnauthorizedException('User not found');
    return this.safe(user);
  }
}
