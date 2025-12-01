import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { Request } from 'express';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from '../dto/create-group.dto';
import { UpdateGroupDto } from '../dto/update-group.dto';
import { UpdateGroupUsersDto } from '../dto/update-group-users.dto';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  createGroup(@Body() dto: CreateGroupDto) {
    return this.groupsService.createGroup(dto);
  }

  @Get()
  findAllGroups(@Req() req: Request) {
    const user = req['user'] as { userId: string; role: string };
    const userId = user?.userId;
    const role = user?.role || 'root';
    return this.groupsService.findAllGroups(userId, role);
  }

  @Get(':id')
  findGroupById(@Param('id') id: string, @Req() req?: Request) {
    const user = req?.['user'] as { userId: string; role: string } | undefined;
    const userId = user?.userId;
    const role = user?.role || 'root';
    return this.groupsService.findGroupById(id, userId, role);
  }

  @Get(':id/project')
  getProjectByGroupId(@Param('id') id: string) {
    return this.groupsService.getProjectByGroupId(id);
  }

  @Patch(':id')
  updateGroup(@Param('id') id: string, @Body() dto: UpdateGroupDto) {
    return this.groupsService.updateGroup(id, dto);
  }

  @Patch(':id/users')
  updateGroupUsers(@Param('id') id: string, @Body() dto: UpdateGroupUsersDto) {
    return this.groupsService.updateGroupUsers(id, dto);
  }

  @Delete(':id')
  deleteGroup(@Param('id') id: string) {
    return this.groupsService.deleteGroup(id);
  }
}


