import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RecordsModule } from './records/records.module';
import { TranscriptionAnalysisModule } from './transcriptions/transcription-analysis.module';
import { ProjectsModule } from './projects/projects.module';
import { CallerDevicesModule } from './caller-devices/caller-devices.module';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import bcryptConfig from './config/bcrypt.config';
import recordsConfig from './config/records.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, bcryptConfig, recordsConfig],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const uri = configService.get<string>('database.uri')
        console.log('uri', uri)
        return ({
          uri: configService.get<string>('database.uri'),
        })
    },
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    RecordsModule,
    TranscriptionAnalysisModule,
    ProjectsModule,
    CallerDevicesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
