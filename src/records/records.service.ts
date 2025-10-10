import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { RecordsEntity, RecordsDocument } from '../schemas/records.schema';
import { TranscriptionService } from './transcription.service';

@Injectable()
export class RecordsService {
  private readonly logger = new Logger(RecordsService.name);

  constructor(
    @InjectModel(RecordsEntity.name) private recordsModel: Model<RecordsDocument>,
    private transcriptionService: TranscriptionService,
    private configService: ConfigService,
  ) {}

  async create(createRecordDto: CreateRecordDto): Promise<RecordsEntity> {
    const createdRecord = new this.recordsModel(createRecordDto);
    return createdRecord.save();
  }

  async findAll(): Promise<RecordsEntity[]> {
    return this.recordsModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<RecordsEntity> {
    return this.recordsModel.findById(id).exec();
  }

  async update(id: string, updateRecordDto: UpdateRecordDto): Promise<RecordsEntity> {
    return this.recordsModel.findByIdAndUpdate(id, updateRecordDto, { new: true }).exec();
  }

  async remove(id: string): Promise<RecordsEntity> {
    return this.recordsModel.findByIdAndDelete(id).exec();
  }

  /**
   * Get the latest record from the database
   */
  async getLatestRecord(): Promise<RecordsEntity | null> {
    return this.recordsModel.findOne().sort({ createdAt: -1 }).exec();
  }

  /**
   * Process and transcribe the latest audio files
   */
  async processLatestRecordings(limit: number = 10): Promise<RecordsEntity[]> {
    this.logger.log(`Processing latest ${limit} recordings for transcription`);
    
    const transcriptionResults = await this.transcriptionService.processLatestRecordings(limit);
    const savedRecords: RecordsEntity[] = [];

    for (const result of transcriptionResults) {
      try {
        const { filePath, parsedInfo, transcription } = result;
        
        // Check if record already exists
        const existingRecord = await this.recordsModel.findOne({ file: filePath }).exec();
        
        if (existingRecord) {
          // Update existing record with transcription
          existingRecord.transcription = transcription;
          const updatedRecord = await existingRecord.save();
          savedRecords.push(updatedRecord);
          this.logger.log(`Updated existing record: ${filePath}`);
        } else {
          // Create new record
          const newRecord = new this.recordsModel({
            user: parsedInfo.userId,
            file: filePath,
            callerId: parsedInfo.contactPhone || 'unknown',
            type: parsedInfo.type,
            transcription: transcription
          });
          
          const savedRecord = await newRecord.save();
          savedRecords.push(savedRecord);
          this.logger.log(`Created new record: ${filePath}`);
        }
      } catch (error) {
        this.logger.error(`Error saving record for ${result.filePath}:`, error);
      }
    }

    return savedRecords;
  }

  /**
   * Transcribe a specific audio file
   */
  async transcribeFile(filePath: string): Promise<RecordsEntity> {
    this.logger.log(`Transcribing specific file: ${filePath}`);
    
    const filename = require('path').basename(filePath);
    const parsedInfo = this.transcriptionService.parseFilename(filename);
    const transcription = await this.transcriptionService.transcribeAudio(filePath);

    console.log('transcription', {transcription});
    
    // Check if record already exists
    const existingRecord = await this.recordsModel.findOne({ file: filePath }).exec();
    
    if (existingRecord) {
      existingRecord.transcription = transcription;
      return existingRecord.save();
    } else {
      const newRecord = new this.recordsModel({
        user: parsedInfo.userId,
        file: filePath,
        callerId: parsedInfo.contactPhone || 'unknown',
        type: parsedInfo.type,
        transcription: transcription
      });
      
      return newRecord.save();
    }
  }

  /**
   * Parse filename structure: timestamp_callerId_type_targetName_targetNumber
   */
  private parseFilenameStructure(filename: string): {
    timestamp: number | null;
    callerId: string | null;
    type: string | null;
    targetName: string | null;
    targetNumber: string | null;
  } {
    const parts = filename.split('_');
    
    if (parts.length < 5) {
      this.logger.warn(`Invalid filename structure: ${filename}. Expected format: timestamp_callerId_type_targetName_targetNumber`);
      return {
        timestamp: null,
        callerId: null,
        type: null,
        targetName: null,
        targetNumber: null
      };
    }

    const timestamp = parseInt(parts[0], 10);
    const callerId = parts[1];
    const type = parts[2];
    const targetName = parts[3];
    const targetNumber = parts[4];

    return {
      timestamp: isNaN(timestamp) ? null : timestamp,
      callerId,
      type,
      targetName,
      targetNumber
    };
  }

  /**
   * Move file from source to destination directory
   */
  private async moveFileToMappedDirectory(sourcePath: string): Promise<string> {
    const recordsPath = this.configService.get<string>('records.recordPath');
    const recordsPathMapped = this.configService.get<string>('records.recordPathMapped');
    
    if (!recordsPath || !recordsPathMapped) {
      throw new Error('RECORDS_PATH or RECORDS_PATH_MAPPED environment variables not set');
    }

    // Ensure mapped directory exists
    if (!fs.existsSync(recordsPathMapped)) {
      fs.mkdirSync(recordsPathMapped, { recursive: true });
    }

    const filename = path.basename(sourcePath);
    const destinationPath = path.join(recordsPathMapped, filename);

    // Move file from source to destination
    fs.renameSync(sourcePath, destinationPath);
    
    this.logger.log(`Moved file from ${sourcePath} to ${destinationPath}`);
    return destinationPath;
  }

  /**
   * Get files from the records directory
   */
  private async getFilesFromRecordsDirectory(): Promise<string[]> {
    const recordsPath = this.configService.get<string>('records.recordPath');
    
    if (!recordsPath) {
      throw new Error('RECORDS_PATH environment variable not set');
    }

    if (!fs.existsSync(recordsPath)) {
      this.logger.warn(`Records directory does not exist: ${recordsPath}`);
      return [];
    }

    const files = fs.readdirSync(recordsPath)
      .filter(file => {
        const filePath = path.join(recordsPath, file);
        return fs.statSync(filePath).isFile() && 
               (file.endsWith('.wav') || file.endsWith('.mp3') || file.endsWith('.m4a'));
      })
      .map(file => path.join(recordsPath, file));

    return files;
  }

  /**
   * Map latest files and parse their filename structure
   * Moves successfully mapped files from RECORDS_PATH to RECORDS_PATH_MAPPED
   * This endpoint only maps files without transcription - for later analysis
   */
  async mapLatestFiles(limit: number = 50): Promise<RecordsEntity[]> {
    this.logger.log(`Mapping latest ${limit} files (without transcription)`);
    
    // Get the latest mapped file timestamp
    const latestMappedRecord = await this.recordsModel
      .findOne({ timestamp: { $ne: null } })
      .sort({ timestamp: -1 })
      .exec();

    const lastTimestamp = latestMappedRecord?.timestamp || 0;
    this.logger.log(`Last mapped timestamp: ${lastTimestamp}`);

    // Get files directly from records directory
    const files = await this.getFilesFromRecordsDirectory();
    const mappedRecords: RecordsEntity[] = [];

    // Sort files by modification time (newest first) and limit
    const sortedFiles = files
      .map(filePath => ({
        filePath,
        mtime: fs.statSync(filePath).mtime.getTime()
      }))
      .sort((a, b) => b.mtime - a.mtime)
      .slice(0, limit)
      .map(item => item.filePath);

    for (const filePath of sortedFiles) {
      try {
        const filename = path.basename(filePath);
        const parsedStructure = this.parseFilenameStructure(filename);

        // Skip files with invalid structure
        if (!parsedStructure.timestamp || !parsedStructure.callerId) {
          this.logger.warn(`Skipping file with invalid structure: ${filename}`);
          continue;
        }

        // Skip files with timestamp less than or equal to last mapped
        if (parsedStructure.timestamp <= lastTimestamp) {
          this.logger.log(`Skipping file ${filename} - timestamp ${parsedStructure.timestamp} <= last mapped ${lastTimestamp}`);
          continue;
        }

        // Check if record already exists
        const existingRecord = await this.recordsModel.findOne({ file: filePath }).exec();
        
        let savedRecord: RecordsDocument;
        
        if (existingRecord) {
          // Update existing record with parsed structure
          existingRecord.timestamp = parsedStructure.timestamp;
          existingRecord.callerId = parsedStructure.callerId || existingRecord.callerId;
          existingRecord.type = parsedStructure.type || existingRecord.type;
          existingRecord.targetName = parsedStructure.targetName;
          existingRecord.targetNumber = parsedStructure.targetNumber;
          
          savedRecord = await existingRecord.save();
          this.logger.log(`Updated existing record with parsed structure: ${filePath}`);
        } else {
          // Create new record with parsed structure (no transcription)
          const newRecord = new this.recordsModel({
            user: 'unknown', // Will be updated when transcription is processed separately
            file: filePath,
            callerId: parsedStructure.callerId || 'unknown',
            type: parsedStructure.type || 'unknown',
            transcription: '', // Empty - will be filled by transcription endpoint
            timestamp: parsedStructure.timestamp,
            targetName: parsedStructure.targetName,
            targetNumber: parsedStructure.targetNumber
          });
          
          savedRecord = await newRecord.save();
          this.logger.log(`Created new record with parsed structure: ${filePath}`);
        }

        // Move file to mapped directory after successful database save
        try {
          const newFilePath = await this.moveFileToMappedDirectory(filePath);
          
          // Update the file path in the database to reflect the new location
          savedRecord.file = newFilePath;
          const updatedRecord = await savedRecord.save();
          
          this.logger.log(`Successfully moved and updated file path: ${filePath} -> ${newFilePath}`);
          mappedRecords.push(updatedRecord);
        } catch (moveError) {
          this.logger.error(`Failed to move file ${filePath} to mapped directory:`, moveError);
          // Still add to mapped records even if file move failed
          mappedRecords.push(savedRecord);
        }
      } catch (error) {
        this.logger.error(`Error mapping record for ${filePath}:`, error);
      }
    }

    this.logger.log(`Successfully mapped ${mappedRecords.length} files (ready for analysis)`);
    return mappedRecords;
  }
}
