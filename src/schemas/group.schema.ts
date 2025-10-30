import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GroupDocument = Group & Document;

@Schema({ timestamps: true })
export class Group {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  projectId: string;

  @Prop({ type: [String], default: [] })
  users: string[];

  @Prop({ default: false })
  deleted: boolean;
}

export const GroupSchema = SchemaFactory.createForClass(Group);


