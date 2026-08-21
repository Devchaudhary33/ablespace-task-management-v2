import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TaskDocument = HydratedDocument<Task>;

@Schema({ _id: true })
export class Subtask {
  @Prop({ required: true }) title!: string;
  @Prop({ default: false }) completed!: boolean;
}
export const SubtaskSchema = SchemaFactory.createForClass(Subtask);

@Schema({ timestamps: true })
export class Task {
  @Prop({ required: true, trim: true }) title!: string;
  @Prop({ default: '' }) description!: string;
  @Prop({ enum: ['todo', 'doing', 'completed', 'on-hold'], default: 'todo' }) status!: string;
  @Prop({ enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' }) priority!: string;
  @Prop({ type: Types.ObjectId, ref: 'User' }) assignee?: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User' }) reporter?: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Project' }) project?: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Team' }) team?: Types.ObjectId;
  @Prop({ type: Date }) dueDate?: Date;
  @Prop({ type: [String], default: [] }) labels!: string[];
  @Prop({ type: [String], default: [] }) resources!: string[];
  @Prop({ type: [SubtaskSchema], default: [] }) subtasks!: Subtask[];
}
export const TaskSchema = SchemaFactory.createForClass(Task);
TaskSchema.index({ status: 1, priority: 1, dueDate: 1 });
TaskSchema.index({ title: 'text', description: 'text' });
