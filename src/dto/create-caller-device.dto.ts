import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateCallerDeviceDto {
  @IsNotEmpty()
  @IsString()
  imei: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  manufacturer?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
