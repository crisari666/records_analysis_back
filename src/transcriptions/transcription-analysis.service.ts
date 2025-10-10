import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RecordsEntity, RecordsDocument } from '../schemas/records.schema';
import * as fs from 'fs';
import * as path from 'path';
import OpenAI from 'openai';

export interface AnalysisResult {
  successSell: boolean;
  amountToPay: number | null;
  reasonFail: string | null;
}

@Injectable()
export class TranscriptionAnalysisService {
  private readonly logger = new Logger(TranscriptionAnalysisService.name);
  private readonly openai: OpenAI;

  constructor(
    @InjectModel(RecordsEntity.name)
    private readonly recordsModel: Model<RecordsDocument>,
  ) {
    // Requires OPENAI_API_KEY environment variable
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

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
      

      // Use OpenAI for analysis
      const analysisResult = await this.analyzeTranscriptionWithOpenAI(transcription, setupConfig);
      
      return analysisResult;
    } catch (error) {
      this.logger.error('Error performing analysis:', error);
      throw error;
    }
  }

  private async analyzeTranscriptionWithOpenAI(transcription: string, config: any): Promise<AnalysisResult> {
    try {
      const systemPrompt = this.buildSystemPrompt(config);
      
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: `Analiza la siguiente transcripción de llamada de ventas:\n\n${transcription}`,
          },
        ],
        temperature: 0.1,
        max_tokens: 500,
      });

      const responseContent = completion.choices[0]?.message?.content;
      
      if (!responseContent) {
        throw new Error('No response received from OpenAI');
      }

      // Parse the JSON response
      const analysisResult = JSON.parse(responseContent) as AnalysisResult;
      
      // Validate the response structure
      this.validateAnalysisResult(analysisResult);
      
      return analysisResult;
    } catch (error) {
      this.logger.error('Error analyzing transcription with OpenAI:', error);
      
      // Fallback to basic analysis if OpenAI fails
      this.logger.warn('Falling back to basic analysis due to OpenAI error');
      return this.performBasicAnalysis(transcription);
    }
  }

  private buildSystemPrompt(config: any): string {
    const instructions = config.instructions.join('\n');
    const outputFormat = JSON.stringify(config.output_format, null, 2);
    const fields = Object.entries(config.fields)
      .map(([key, description]) => `- ${key}: ${description}`)
      .join('\n');
    
    const exampleAnalysis = JSON.stringify(config.example_analysis, null, 2);
    const exampleFail = JSON.stringify(config.example_analysis_fail, null, 2);

    return `${instructions}

${outputFormat}

Campos requeridos:
${fields}

Ejemplos de análisis:

Ejemplo 1 (venta exitosa):
${exampleAnalysis}

Ejemplo 2 (venta fallida):
${exampleFail}

Responde ÚNICAMENTE con el JSON válido, sin texto adicional.`;
  }

  private validateAnalysisResult(result: any): void {
    if (typeof result.successSell !== 'boolean') {
      throw new Error('Invalid analysis result: successSell must be a boolean');
    }
    
    if (result.amountToPay !== null && typeof result.amountToPay !== 'number') {
      throw new Error('Invalid analysis result: amountToPay must be a number or null');
    }
    
    if (result.reasonFail !== null && typeof result.reasonFail !== 'string') {
      throw new Error('Invalid analysis result: reasonFail must be a string or null');
    }
  }

  private performBasicAnalysis(transcription: string): AnalysisResult {
    const lowerTranscription = transcription.toLowerCase();
    
    // Basic analysis logic as fallback
    const positiveIndicators = [
      'sí', 'si', 'acepto', 'perfecto', 'de acuerdo', 'está bien', 
      'comprar', 'pagar', 'comprobante', 'enviar', 'confirmar'
    ];
    
    const negativeIndicators = [
      'no', 'no gracias', 'no estoy interesado', 'no me interesa', 
      'no quiero', 'no puedo', 'no tengo', 'no necesito'
    ];
    
    const amountPattern = /(\d+(?:\.\d+)?)\s*(?:millones?|pesos?|m)/gi;
    const amountMatches = transcription.match(amountPattern);
    
    let amountToPay: number | null = null;
    if (amountMatches) {
      const amountMatch = amountMatches[0];
      const numberMatch = amountMatch.match(/(\d+(?:\.\d+)?)/);
      if (numberMatch) {
        let amount = parseFloat(numberMatch[1]);
        if (amountMatch.toLowerCase().includes('millones') || amountMatch.toLowerCase().includes('millón')) {
          amount = amount * 1000000;
        }
        amountToPay = Math.round(amount);
      }
    }
    
    const hasPositiveIndicators = positiveIndicators.some(indicator => 
      lowerTranscription.includes(indicator)
    );
    
    const hasNegativeIndicators = negativeIndicators.some(indicator => 
      lowerTranscription.includes(indicator)
    );
    
    let successSell: boolean;
    let reasonFail: string | null = null;
    
    if (hasNegativeIndicators && !hasPositiveIndicators) {
      successSell = false;
      reasonFail = 'El cliente no mostró interés en comprar.';
    } else if (hasPositiveIndicators && amountToPay !== null) {
      successSell = true;
    } else if (hasPositiveIndicators && amountToPay === null) {
      successSell = false;
      reasonFail = 'No se mencionó un monto específico para la venta.';
    } else {
      successSell = false;
      reasonFail = 'No se identificaron indicadores claros de una venta exitosa.';
    }
    
    return {
      successSell,
      amountToPay,
      reasonFail,
    };
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
