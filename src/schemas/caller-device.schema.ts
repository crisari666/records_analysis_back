import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type CallerDeviceDocument = CallerDevice & Document;

@Schema({ timestamps: true })
export class CallerDevice {
  @Prop({ required: true, unique: true, trim: true })
  imei: string;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  brand: string;

  @Prop({ trim: true })
  model?: string;
  
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null })
  project: string;

  @Prop({ trim: true })
  phoneNumber?: string;

  @Prop({ default: false })
  deleted: boolean;
}

export const CallerDeviceSchema = SchemaFactory.createForClass(CallerDevice);
