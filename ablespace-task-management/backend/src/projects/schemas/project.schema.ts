import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ProjectDocument = HydratedDocument<Project>;

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true, trim: true }) name!: string;
  @Prop({ default: '' }) description!: string;
  @Prop({ enum: ['low','medium','high','urgent'], default: 'medium' }) priority!: string;
  @Prop({ enum: ['planning','active','completed','on-hold'], default: 'active' }) status!: string;
  @Prop({ type: Types.ObjectId, ref: 'User' }) lead?: Types.ObjectId;
  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] }) members!: Types.ObjectId[];
  @Prop({ type: Date }) dueDate?: Date;
}
export const ProjectSchema = SchemaFactory.createForClass(Project);
