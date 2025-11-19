import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
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
  findAllGroups(@Query('projectId') projectId?: string) {
    return this.groupsService.findAllGroups(projectId);
  }

  @Get(':id')
  findGroupById(@Param('id') id: string) {
    return this.groupsService.findGroupById(id);
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


