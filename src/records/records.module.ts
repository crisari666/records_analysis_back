import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { RecordsService } from './records.service';
import { RecordsController } from './records.controller';
import { TranscriptionService } from './transcription.service';
import { RecordsEntity, RecordsSchema } from '../schemas/records.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: RecordsEntity.name, schema: RecordsSchema }]),
    ConfigModule,
  ],
  controllers: [RecordsController],
  providers: [RecordsService, TranscriptionService],
  exports: [RecordsService, TranscriptionService],
})
export class RecordsModule {}
