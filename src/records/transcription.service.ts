import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class TranscriptionService {
  private readonly logger = new Logger(TranscriptionService.name);
  private openaiClient: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('records.openaiApiKey');
    if (!apiKey) {
      this.logger.warn('OPENAI_API_KEY not found in environment variables');
    } else {
      this.openaiClient = new OpenAI({ apiKey: apiKey });
    }
  }

  /**
   * Parse filename to extract record information
   * Format: %timestamp%_%userId%_%type%_[%contactName%]_[%contactPhone%]_%date%
   */
  parseFilename(filename: string) {
    const nameWithoutExt = path.parse(filename).name;
    const parts = nameWithoutExt.split('_');
    
    if (parts.length < 6) {
      throw new Error(`Invalid filename format: ${filename}`);
    }

    return {
      timestamp: parts[0],
      userId: parts[1],
      type: parts[2],
      contactName: parts[3]?.replace(/[\[\]]/g, '') || null,
      contactPhone: parts[4]?.replace(/[\[\]]/g, '') || null,
      date: parts[5],
      originalFilename: filename
    };
  }

  /**
   * Get the latest audio files from the records directory
   */
  async getLatestAudioFiles(limit: number = 10): Promise<string[]> {
    const recordPath = this.configService.get<string>('records.recordPath');
    console.log('recordPath', recordPath);
    
    if (!recordPath) {
      throw new Error('RECORD_PATH environment variable not set');
    }

    if (!fs.existsSync(recordPath)) {
      throw new Error(`Record path does not exist: ${recordPath}`);
    }

    const files = fs.readdirSync(recordPath);
    const audioFiles = files
      .filter(file => /\.(mp3|wav|m4a|aac|ogg)$/i.test(file))
      .map(file => ({
        name: file,
        path: path.join(recordPath, file),
        stats: fs.statSync(path.join(recordPath, file))
      }))
      .sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime())
      .slice(0, limit)
      .map(file => file.path);

    return audioFiles;
  }

  /**
   * Transcribe audio file using OpenAI API
   */
  async transcribeAudio(audioFilePath: string): Promise<string> {
    if (!this.openaiClient) {
      throw new Error('OpenAI client not initialized. Please set OPENAI_API_KEY environment variable.');
    }

    try {
      this.logger.log(`Transcribing audio file: ${audioFilePath}`);
      
      const transcription = await this.openaiClient.audio.transcriptions.create({
        file: fs.createReadStream(audioFilePath),
        model: 'whisper-1',
        language: 'es', // You can make this configurable
      });

      this.logger.log(`Transcription completed for: ${audioFilePath}`);
      return transcription.text;
    } catch (error) {
      this.logger.error(`Error transcribing audio file ${audioFilePath}:`, error);
      throw new Error(`Failed to transcribe audio: ${error.message}`);
    }
  }

  /**
   * Process latest audio files and return transcription results
   */
  async processLatestRecordings(limit: number = 10): Promise<Array<{
    filePath: string;
    parsedInfo: any;
    transcription: string;
  }>> {
    const audioFiles = await this.getLatestAudioFiles(limit);
    const results = [];

    for (const filePath of audioFiles) {
      try {
        const filename = path.basename(filePath);
        const parsedInfo = this.parseFilename(filename);
        const transcription = await this.transcribeAudio(filePath);
        
        results.push({
          filePath,
          parsedInfo,
          transcription
        });
      } catch (error) {
        this.logger.error(`Error processing file ${filePath}:`, error);
        // Continue with other files even if one fails
      }
    }

    return results;
  }
}
