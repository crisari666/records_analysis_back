import { Module, NestModule, MiddlewareConsumer, RequestMethod, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from '../schemas/user.schema';
import { AuthModule } from '../auth/auth.module';
import { JwtMiddleware } from '../auth/jwt.middleware';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [UsersService, JwtService],
  exports: [UsersService],
})
export class UsersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware)
      .forRoutes(
        { path: 'users', method: RequestMethod.GET },
        { path: 'users/:id', method: RequestMethod.GET },
        { path: 'users/:id', method: RequestMethod.PATCH },
        { path: 'users/:id', method: RequestMethod.DELETE },
      );
  }
}

