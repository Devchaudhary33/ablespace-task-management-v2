import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TeamDocument = HydratedDocument<Team>;

@Schema({ timestamps: true })
export class Team {
  @Prop({ required: true }) name!: string;
  @Prop({ default: '' }) description!: string;
  @Prop({ type: Types.ObjectId, ref: 'User' }) lead?: Types.ObjectId;
  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] }) members!: Types.ObjectId[];
}
export const TeamSchema = SchemaFactory.createForClass(Team);
