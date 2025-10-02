import { IsNotEmpty, IsString } from 'class-validator';

export class AuthDto {
  @IsNotEmpty()
  @IsString()
  identifier: string; // Can be user or email

  @IsNotEmpty()
  @IsString()
  password: string;
}
