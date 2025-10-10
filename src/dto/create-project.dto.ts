import { IsNotEmpty, IsString, IsOptional, IsArray, IsObject, IsBoolean } from 'class-validator';

export class CreateProjectDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsObject()
  config?: any;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  devices?: string[];
}
