import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateCallerDeviceDto {
  @IsNotEmpty()
  @IsString()
  imei: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  brand: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
