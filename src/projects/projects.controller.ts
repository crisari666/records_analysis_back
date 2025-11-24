import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { Request } from 'express';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { UpdateProjectDevicesDto } from '../dto/update-project-devices.dto';
import { UpdateProjectUsersDto } from '../dto/update-project-users.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  createProject(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.createProject(createProjectDto);
  }

  @Get()
  findAllProjects(@Req() req: Request) {
    const userId = (req.user as any)?._id;
    return this.projectsService.findAllProjects(userId);
  }

  @Get(':id')
  findProjectById(@Param('id') id: string) {
    return this.projectsService.findProjectById(id);
  }

  @Patch(':id')
  updateProject(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.updateProject(id, updateProjectDto);
  }

  @Patch(':id/devices')
  updateProjectDevices(@Param('id') id: string, @Body() updateProjectDevicesDto: UpdateProjectDevicesDto) {
    return this.projectsService.updateProjectDevices(id, updateProjectDevicesDto);
  }

  @Patch(':id/users')
  updateProjectUsers(@Param('id') id: string, @Body() updateProjectUsersDto: UpdateProjectUsersDto) {
    return this.projectsService.updateProjectUsers(id, updateProjectUsersDto);
  }

  @Delete(':id')
  deleteProject(@Param('id') id: string) {
    return this.projectsService.deleteProject(id);
  }
}
