import { registerAs } from '@nestjs/config';

export default registerAs('records', () => ({
  recordPath: process.env.RECORDS_PATH || 'not set recors path',
  recordPathMapped: process.env.RECORDS_PATH_MAPPED || 'not set mapped path',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
}));
