import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const databaseName = process.env.DATABASE_NAME;
  const dataBasePass = process.env.DATABASE_PASS;
  const dataBaseUser = process.env.DATABASE_USER;
  const HOST = process.env.DATABASE_HOST;
  const PORT = process.env.DATABASE_PORT;
  const port = process.env.APP_PORT;

  console.log({ databaseName, dataBasePass, dataBaseUser, HOST, PORT, port });  
  
  app.setGlobalPrefix('rest');
  
  // app.useGlobalPipes(new ValidationPipe({
  //   whitelist: true,
  //   forbidNonWhitelisted: true,
  //   transform: true,
  // }));

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  await app.listen(port);
}
bootstrap();
