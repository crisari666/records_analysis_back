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
  @Cron(CronExpression.EVERY_5_MINUTES)
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
}
