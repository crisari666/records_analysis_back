import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { Group, GroupSchema } from '../schemas/group.schema';
import { Project, ProjectSchema } from '../schemas/project.schema';
import { JwtMiddleware } from '../auth/jwt.middleware';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Group.name, schema: GroupSchema },
      { name: Project.name, schema: ProjectSchema },
    ]),
  ],
  controllers: [GroupsController],
  providers: [GroupsService, JwtService],
  exports: [GroupsService],
})
export class GroupsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware)
      .forRoutes(
        { path: 'groups', method: RequestMethod.GET },
        { path: 'groups/:id', method: RequestMethod.GET },
        { path: 'groups/:id/project', method: RequestMethod.GET },
        { path: 'groups', method: RequestMethod.POST },
        { path: 'groups/:id', method: RequestMethod.PATCH },
        { path: 'groups/:id/users', method: RequestMethod.PATCH },
        { path: 'groups/:id', method: RequestMethod.DELETE },
      );
  }
}


