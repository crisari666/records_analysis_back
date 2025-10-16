import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TranscriptionAnalysisController } from './transcription-analysis.controller';
import { TranscriptionAnalysisService } from './transcription-analysis.service';
import { OllamaService } from './ollama.service';
import { RecordsEntity, RecordsSchema } from '../schemas/records.schema';
import { Project, ProjectSchema } from '../schemas/project.schema';
import { CallerDevice, CallerDeviceSchema } from '../schemas/caller-device.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RecordsEntity.name, schema: RecordsSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: CallerDevice.name, schema: CallerDeviceSchema },
    ]),
  ],
  controllers: [TranscriptionAnalysisController],
  providers: [TranscriptionAnalysisService, OllamaService],
  exports: [TranscriptionAnalysisService, OllamaService],
})
export class TranscriptionAnalysisModule {}
