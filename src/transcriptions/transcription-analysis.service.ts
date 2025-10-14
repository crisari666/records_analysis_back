import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RecordsEntity, RecordsDocument } from '../schemas/records.schema';
import * as fs from 'fs';
import * as path from 'path';
import { OllamaService } from './ollama.service';

export interface AnalysisResult {
  successSell: boolean;
  amountToPay: number | null;
  reasonFail: string | null;
}

@Injectable()
export class TranscriptionAnalysisService {
  private readonly logger = new Logger(TranscriptionAnalysisService.name);

  constructor(
    @InjectModel(RecordsEntity.name)
    private readonly recordsModel: Model<RecordsDocument>,
    private readonly ollamaService: OllamaService,
  ) {}

  async analyzeTranscriptionById(recordId: string): Promise<AnalysisResult> {
    try {
      const record = await this.recordsModel.findById(recordId).exec();
      
      if (!record) {
        throw new Error(`Record with ID ${recordId} not found`);
      }

      if (!record.transcription) {
        throw new Error(`Record with ID ${recordId} has no transcription`);
      }

      const analysisResult = await this.performAnalysis(record.transcription);

      console.log('analysisResult', analysisResult);
      
      // Update the record with analysis results
      await this.recordsModel.findByIdAndUpdate(recordId, {
        successSell: analysisResult.successSell,
        amountToPay: analysisResult.amountToPay,
        reasonFail: analysisResult.reasonFail,
      }).exec();

      this.logger.log(`Analysis completed for record ${recordId}`);
      return analysisResult;
    } catch (error) {
      this.logger.error(`Error analyzing transcription for record ${recordId}:`, error);
      throw error;
    }
  }

  async analyzeFirstRecordsWithoutAnalysis(limit: number = 10): Promise<AnalysisResult[]> {
    try {
      const records = await this.recordsModel
        .find({
          transcription: { $exists: true, $ne: null, $nin: [''] },
          successSell: null,
        })
        .limit(limit)
        .exec();

      if (records.length === 0) {
        this.logger.log('No records found without analysis results');
        return [];
      }

      const analysisResults: AnalysisResult[] = [];

      for (const record of records) {
        try {
          const analysisResult = await this.performAnalysis(record.transcription);
          
          // Update the record with analysis results
          await this.recordsModel.findByIdAndUpdate(record._id, {
            successSell: analysisResult.successSell,
            amountToPay: analysisResult.amountToPay,
            reasonFail: analysisResult.reasonFail,
          }).exec();

          analysisResults.push(analysisResult);
          this.logger.log(`Analysis completed for record ${record._id}`);
        } catch (error) {
          this.logger.error(`Error analyzing record ${record._id}:`, error);
          // Continue with other records even if one fails
        }
      }

      return analysisResults;
    } catch (error) {
      this.logger.error('Error analyzing first records without analysis:', error);
      throw error;
    }
  }

  private async performAnalysis(transcription: string): Promise<AnalysisResult> {
    try {
      // Load the setup configuration
      const setupPath = path.join(process.cwd(), 'src', 'app', 'setup.json');
      const setupConfig = JSON.parse(fs.readFileSync(setupPath, 'utf8'));

      console.log({transcription});
      

      // Use Ollama for analysis
      const analysisResult = await this.ollamaService.analyzeTranscription(transcription, setupConfig);
      
      return analysisResult;
    } catch (error) {
      this.logger.error('Error performing analysis:', error);
      throw error;
    }
  }


  async getRecordsWithoutAnalysis(limit: number = 10): Promise<RecordsEntity[]> {
    return this.recordsModel
      .find({
        transcription: { $exists: true, $ne: null, $nin: [''] },
        successSell: null,
      })
      .limit(limit)
      .exec();
  }

  async getRecordsWithTranscriptions(limit: number = 10): Promise<RecordsEntity[]> {
    return this.recordsModel
      .find({
        transcription: { $exists: true, $ne: null, $nin: [''] },
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async getRecordById(id: string): Promise<RecordsEntity | null> {
    return this.recordsModel.findById(id).exec();
  }

  async getAnalysisStats(): Promise<{
    totalRecords: number;
    analyzedRecords: number;
    pendingAnalysis: number;
    successfulSales: number;
    failedSales: number;
  }> {
    const totalRecords = await this.recordsModel.countDocuments({
      transcription: { $exists: true, $ne: null, $nin: [''] },
    });
    
    const analyzedRecords = await this.recordsModel.countDocuments({
      transcription: { $exists: true, $ne: null, $nin: [''] },
      successSell: { $ne: null },
    });
    
    const pendingAnalysis = totalRecords - analyzedRecords;
    
    const successfulSales = await this.recordsModel.countDocuments({
      successSell: true,
    });
    
    const failedSales = await this.recordsModel.countDocuments({
      successSell: false,
    });
    
    return {
      totalRecords,
      analyzedRecords,
      pendingAnalysis,
      successfulSales,
      failedSales,
    };
  }
}
