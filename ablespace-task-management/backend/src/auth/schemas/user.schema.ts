import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({ default: 'Member' })
  title!: string;

  @Prop({ default: '' })
  avatar!: string;

  @Prop({ default: 'member' })
  role!: string;

  @Prop({ type: [Types.ObjectId], ref: 'Team', default: [] })
  teams!: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
