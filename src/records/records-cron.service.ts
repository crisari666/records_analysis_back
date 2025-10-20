import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RecordsService } from './records.service';

@Injectable()
export class RecordsCronService {
  private readonly logger = new Logger(RecordsCronService.name);

  constructor(private readonly recordsService: RecordsService) {}

  /**
   * Cron job that runs every 5 minutes to map latest files
   * This will automatically process new files and move them to the mapped directory
   */
  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleMapLatestFiles() {
    this.logger.log('Starting scheduled mapLatestFiles job...');
    try {
      const result = await this.recordsService.mapLatestFiles(50);
      this.logger.log(`Scheduled mapLatestFiles completed successfully. Processed ${result.length} files.`);
    } catch (error) {
      
      this.logger.error('Error in scheduled mapLatestFiles job:', error);
    }
  }

  /**
   * Cron job that runs every 10 minutes to transcribe mapped files
   * This will automatically transcribe files that have been mapped but not yet transcribed
   */
  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleTranscribeMappedFiles() {
    this.logger.log('Starting scheduled transcribeMappedFiles job...');
    try {
      const result = await this.recordsService.transcribeMappedFiles(20);
      this.logger.log(`Scheduled transcribeMappedFiles completed successfully. Processed ${result.length} files.`);
    } catch (error) {
      this.logger.error('Error in scheduled transcribeMappedFiles job:', error);
    }
  }

  /**
   * Manual trigger for testing purposes
   * Can be called via API endpoint if needed
   */
  async triggerMapLatestFiles(limit: number = 50) {
    this.logger.log(`Manually triggering mapLatestFiles with limit: ${limit}`);
    
    try {
      const result = await this.recordsService.mapLatestFiles(limit);
      this.logger.log(`Manual mapLatestFiles completed successfully. Processed ${result.length} files.`);
      return result;
    } catch (error) {
      this.logger.error('Error in manual mapLatestFiles trigger:', error);
      throw error;
    }
  }

  /**
   * Manual trigger for transcription testing purposes
   * Can be called via API endpoint if needed
   */
  async triggerTranscribeMappedFiles(limit: number = 20) {
    this.logger.log(`Manually triggering transcribeMappedFiles with limit: ${limit}`);
    
    try {
      const result = await this.recordsService.transcribeMappedFiles(limit);
      this.logger.log(`Manual transcribeMappedFiles completed successfully. Processed ${result.length} files.`);
      return result;
    } catch (error) {
      this.logger.error('Error in manual transcribeMappedFiles trigger:', error);
      throw error;
    }
  }
}
