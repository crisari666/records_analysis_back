import { Injectable, Logger } from '@nestjs/common';
import { Ollama } from 'ollama';

export interface OllamaAnalysisResult {
  successSell: boolean;
  amountToPay: number | null;
  reasonFail: string | null;
}

@Injectable()
export class OllamaService {
  private readonly logger = new Logger(OllamaService.name);
  private readonly ollama: Ollama;

  constructor() {
    this.ollama = new Ollama({
      host: process.env.OLLAMA_HOST || 'http://localhost:11434',
    });
  }

  async analyzeTranscription(transcription: string, config: any): Promise<OllamaAnalysisResult> {
    try {
      const systemPrompt = this.buildSystemPrompt(config);
      
      this.logger.log('Sending request to Ollama with deepseek-llm model');
      
      const response = await this.ollama.chat({
        model: 'deepseek-llm',
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
        options: {
          temperature: 0.1,
          num_predict: 500,
        },
      });

      // console.log('response', systemPrompt);
      // console.log('transcription', transcription);
      // console.log('response', response);

      const responseContent = response.message?.content;
      
      if (!responseContent) {
        throw new Error('No response received from Ollama');
      }

      this.logger.log('Received response from Ollama, parsing JSON');
      
      // Parse the JSON response
      const analysisResult = JSON.parse(responseContent).example as OllamaAnalysisResult;

      return analysisResult;
    } catch (error) {
      this.logger.error('Error analyzing transcription with Ollama:', error);
      
      const newLocal = this;
      // Fallback to basic analysis if Ollama fails
      newLocal.logger.warn('Falling back to basic analysis due to Ollama error');
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

  private performBasicAnalysis(transcription: string): OllamaAnalysisResult {
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

  async checkModelAvailability(): Promise<boolean> {
    try {
      const models = await this.ollama.list();
      const deepseekModel = models.models.find(model => model.name.includes('deepseek-llm'));
      
      if (!deepseekModel) {
        this.logger.warn('deepseek-llm model not found. Available models:', models.models.map(m => m.name));
        return false;
      }
      
      this.logger.log('deepseek-llm model is available');
      return true;
    } catch (error) {
      this.logger.error('Error checking model availability:', error);
      return false;
    }
  }

  async pullModel(): Promise<void> {
    try {
      this.logger.log('Pulling deepseek-llm model...');
      await this.ollama.pull({ model: 'deepseek-llm' });
      this.logger.log('deepseek-llm model pulled successfully');
    } catch (error) {
      this.logger.error('Error pulling deepseek-llm model:', error);
      throw error;
    }
  }
}
