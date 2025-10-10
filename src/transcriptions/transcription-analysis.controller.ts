import { Controller, Get, Post, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { TranscriptionAnalysisService, AnalysisResult } from './transcription-analysis.service';

@Controller('transcriptions')
export class TranscriptionAnalysisController {
  constructor(
    private readonly transcriptionAnalysisService: TranscriptionAnalysisService,
  ) {}

  @Post('analyze/:id')
  async analyzeTranscriptionById(@Param('id') id: string) {
    try {
      const result = await this.transcriptionAnalysisService.analyzeTranscriptionById(id);
      return {
        success: true,
        data: result,
        message: 'Transcription analysis completed successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Error analyzing transcription',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('analyze-latest')
  async analyzeLatestTranscriptions(@Query('limit') limit?: string) {
    try {
      const limitNumber = limit ? parseInt(limit, 10) : 10;
      const results = await this.transcriptionAnalysisService.analyzeFirstRecordsWithoutAnalysis(limitNumber);
      
      return {
        success: true,
        data: results,
        message: `Analysis completed for ${results.length} transcriptions`,
        count: results.length,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Error analyzing latest transcriptions',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('pending')
  async getPendingAnalysis(@Query('limit') limit?: string) {
    try {
      const limitNumber = limit ? parseInt(limit, 10) : 10;
      const records = await this.transcriptionAnalysisService.getRecordsWithoutAnalysis(limitNumber);
      
      return {
        success: true,
        data: records,
        message: `Found ${records.length} records pending analysis`,
        count: records.length,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Error fetching pending analysis records',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('stats')
  async getAnalysisStats() {
    try {
      const stats = await this.transcriptionAnalysisService.getAnalysisStats();
      
      return {
        success: true,
        data: stats,
        message: 'Analysis statistics retrieved successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Error fetching analysis statistics',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('records')
  async getRecordsWithTranscriptions(@Query('limit') limit?: string) {
    try {
      const limitNumber = limit ? parseInt(limit, 10) : 10;
      const records = await this.transcriptionAnalysisService.getRecordsWithTranscriptions(limitNumber);
      
      return {
        success: true,
        data: records,
        message: `Found ${records.length} records with transcriptions`,
        count: records.length,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Error fetching records with transcriptions',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('records/:id')
  async getRecordById(@Param('id') id: string) {
    try {
      const record = await this.transcriptionAnalysisService.getRecordById(id);
      
      if (!record) {
        throw new HttpException(
          {
            success: false,
            message: 'Record not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      
      return {
        success: true,
        data: record,
        message: 'Record retrieved successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Error fetching record',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('health')
  async healthCheck() {
    return {
      success: true,
      message: 'Transcription analysis service is running',
      timestamp: new Date().toISOString(),
    };
  }
}
