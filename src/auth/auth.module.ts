import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtMiddleware } from './jwt.middleware';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const jwtConfig = configService.get('jwt');
        return {
          privateKey: jwtConfig.privateKey,
          publicKey: jwtConfig.publicKey,
          signOptions: { 
            algorithm: jwtConfig.algorithm,
            expiresIn: jwtConfig.expiresIn 
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtMiddleware],
  exports: [AuthService, JwtMiddleware],
})
export class AuthModule {}

