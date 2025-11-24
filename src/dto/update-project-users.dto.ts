import { IsNotEmpty, IsArray, IsString } from 'class-validator';

export class UpdateProjectUsersDto {
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  users: string[];
}

