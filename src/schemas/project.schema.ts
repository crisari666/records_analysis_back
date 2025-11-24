import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProjectDocument = Project & Document;

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ type: Object, default: {} })
  config: any;

  @Prop({ type: [String], default: [] })
  devices: string[];

  @Prop({ type: [String], default: [] })
  users: string[];

  @Prop({ default: false })
  deleted: boolean;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
