import { IsString, IsOptional } from 'class-validator';

export class UpdateCallerDeviceProjectDto {
  @IsOptional()
  @IsString()
  project?: string;
}
