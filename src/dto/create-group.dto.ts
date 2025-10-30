import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateGroupDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  projectId: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  users?: string[];
}


