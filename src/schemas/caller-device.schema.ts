import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CallerDeviceDocument = CallerDevice & Document;

@Schema({ timestamps: true })
export class CallerDevice {
  @Prop({ required: true, unique: true, trim: true })
  imei: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  model?: string;

  @Prop({ trim: true })
  manufacturer?: string;

  @Prop({ trim: true })
  phoneNumber?: string;

  @Prop({ default: false })
  deleted: boolean;
}

export const CallerDeviceSchema = SchemaFactory.createForClass(CallerDevice);
