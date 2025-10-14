import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TranscriptionAnalysisController } from './transcription-analysis.controller';
import { TranscriptionAnalysisService } from './transcription-analysis.service';
import { OllamaService } from './ollama.service';
import { RecordsEntity, RecordsSchema } from '../schemas/records.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RecordsEntity.name, schema: RecordsSchema },
    ]),
  ],
  controllers: [TranscriptionAnalysisController],
  providers: [TranscriptionAnalysisService, OllamaService],
  exports: [TranscriptionAnalysisService, OllamaService],
})
export class TranscriptionAnalysisModule {}
