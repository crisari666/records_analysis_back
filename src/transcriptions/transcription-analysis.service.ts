import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RecordsEntity, RecordsDocument } from '../schemas/records.schema';
import { Project, ProjectDocument } from '../schemas/project.schema';
import { CallerDevice, CallerDeviceDocument } from '../schemas/caller-device.schema';
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
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
    @InjectModel(CallerDevice.name)
    private readonly callerDeviceModel: Model<CallerDeviceDocument>,
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

      const analysisResult = await this.performAnalysis(record.transcription, record.callerId);      
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
          const analysisResult = await this.performAnalysis(record.transcription, record.callerId);
          
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

  private async performAnalysis(transcription: string, callerId: string): Promise<AnalysisResult> {
    try {
      // Get the caller device to find the project
      const callerDevice = await this.callerDeviceModel.findOne({ title: callerId }).exec();
      
      if (!callerDevice) {
        throw new Error(`Caller device with ID ${callerId} not found`);
      }

      if (!callerDevice.project) {
        throw new Error(`Caller device ${callerId} is not assigned to any project`);
      }

      // Get the project configuration
      const project = await this.projectModel.findById(callerDevice.project).exec();
      
      if (!project) {
        throw new Error(`Project with ID ${callerDevice.project} not found`);
      }

      // Use the project's config as setup configuration
      const setupConfig = project.config || {};

      // console.log({transcription, callerId, projectId: callerDevice.project});
      

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
