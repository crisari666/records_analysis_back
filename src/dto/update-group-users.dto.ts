import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class UpdateGroupUsersDto {
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  users: string[];
}


