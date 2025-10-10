import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RecordsDocument = RecordsEntity & Document;

@Schema({ timestamps: true })
export class RecordsEntity {
  @Prop({ required: true, trim: true })
  user: string;

  @Prop({ required: true, trim: true })
  file: string;

  @Prop({ required: true, trim: true })
  callerId: string;

  @Prop({ required: true, trim: true })
  transcription: string;

  @Prop({ required: true, trim: true })
  type: string;

  @Prop({ default: null })
  successSell: boolean | null;

  @Prop({ default: null })
  amountToPay: number | null;

  @Prop({ default: null, trim: true })
  reasonFail: string | null;

  // Parsed filename fields
  @Prop({ default: null })
  timestamp: number | null;

  @Prop({ default: null, trim: true })
  targetName: string | null;

  @Prop({ default: null, trim: true })
  targetNumber: string | null;
}

export const RecordsSchema = SchemaFactory.createForClass(RecordsEntity);
