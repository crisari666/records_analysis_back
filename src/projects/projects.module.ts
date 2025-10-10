import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { Project, ProjectSchema } from '../schemas/project.schema';
import { JwtMiddleware } from '../auth/jwt.middleware';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }]),
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService, JwtService],
  exports: [ProjectsService],
})
export class ProjectsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware)
      .forRoutes(
        { path: 'projects', method: RequestMethod.GET },
        { path: 'projects/:id', method: RequestMethod.GET },
        { path: 'projects', method: RequestMethod.POST },
        { path: 'projects/:id', method: RequestMethod.PATCH },
        { path: 'projects/:id/devices', method: RequestMethod.PATCH },
        { path: 'projects/:id', method: RequestMethod.DELETE },
      );
  }
}
