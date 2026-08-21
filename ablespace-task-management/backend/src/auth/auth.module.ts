import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { User, UserSchema } from './schemas/user.schema';

@Module({
  imports: [
    ConfigModule,

    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
    ]),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],

  controllers: [AuthController],

  providers: [
    AuthService,
    JwtAuthGuard,
  ],

  exports: [
    JwtAuthGuard,
    JwtModule,
    MongooseModule,
  ],
})
export class AuthModule {}