import { IsString, IsOptional } from 'class-validator';

export class CreateRecordDto {
  @IsString()
  user: string;

  @IsString()
  file: string;

  @IsString()
  callerId: string;

  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  transcription?: string;
}
