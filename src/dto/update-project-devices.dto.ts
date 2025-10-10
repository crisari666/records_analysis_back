import { IsArray, IsString } from 'class-validator';

export class UpdateProjectDevicesDto {
  @IsArray()
  @IsString({ each: true })
  devices: string[];
}
