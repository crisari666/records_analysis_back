import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { RecordsService } from './records.service';
import { RecordsController } from './records.controller';
import { TranscriptionService } from './transcription.service';
import { RecordsCronService } from './records-cron.service';
import { RecordsEntity, RecordsSchema } from '../schemas/records.schema';
import { TranscriptionAnalysisModule } from '../transcriptions/transcription-analysis.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: RecordsEntity.name, schema: RecordsSchema }]),
    ConfigModule,
    TranscriptionAnalysisModule,
  ],
  controllers: [RecordsController],
  providers: [RecordsService, TranscriptionService, RecordsCronService],
  exports: [RecordsService, TranscriptionService, RecordsCronService],
})
export class RecordsModule {}
