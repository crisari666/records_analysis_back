import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectDocument } from '../schemas/project.schema';
import { CallerDevice, CallerDeviceDocument } from '../schemas/caller-device.schema';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { UpdateProjectDevicesDto } from '../dto/update-project-devices.dto';
import { UpdateProjectUsersDto } from '../dto/update-project-users.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(CallerDevice.name) private callerDeviceModel: Model<CallerDeviceDocument>,
    private usersService: UsersService,
  ) {}

  async createProject(createProjectDto: CreateProjectDto): Promise<Project> {
    const project = new this.projectModel(createProjectDto);
    return await project.save();
  }

  async findAllProjects(userId?: string): Promise<Project[]> {
    const query: any = { 
      $or: [{ deleted: false }, { deleted: { $exists: false } }] 
    };

    // If userId is provided, check user role to filter projects
    if (userId) {
      const user = await this.usersService.findUserById(userId);
      
      // If user is root, return all projects (no additional filter)
      // If user is admin or user, return only projects where user is in the users array
      if (user.role !== 'root') {
        query.users = userId;
      }
    }

    return this.projectModel.find(query).exec();
  }

  async findProjectById(id: string): Promise<Project> {
    const project = await this.projectModel.findOne({ 
      _id: id, 
      $or: [{ deleted: false }, { deleted: { $exists: false } }] 
    }).exec();
    
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  async updateProject(id: string, updateProjectDto: UpdateProjectDto): Promise<Project> {
    const project = await this.projectModel.findOneAndUpdate(
      { 
        _id: id, 
        $or: [{ deleted: false }, { deleted: { $exists: false } }] 
      },
      updateProjectDto,
      { new: true }
    ).exec();

    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  async updateProjectDevices(id: string, updateProjectDevicesDto: UpdateProjectDevicesDto): Promise<Project> {
    const { devices } = updateProjectDevicesDto;
    
    // First, verify the project exists
    const project = await this.projectModel.findOne({ 
      _id: id, 
      $or: [{ deleted: false }, { deleted: { $exists: false } }] 
    }).exec();
    
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Remove all devices from other projects that are being assigned to this project
    if (devices.length > 0) {
      await this.projectModel.updateMany(
        { 
          _id: { $ne: id },
          $or: [{ deleted: false }, { deleted: { $exists: false } }],
          devices: { $in: devices }
        },
        { 
          $pull: { devices: { $in: devices } }
        }
      ).exec();
    }

    // Update caller devices project field
    // First, remove project assignment from devices that are no longer in this project
    await this.callerDeviceModel.updateMany(
      { 
        project: id,
        $or: [{ deleted: false }, { deleted: { $exists: false } }],
        _id: { $nin: devices }
      },
      { $unset: { project: 1 } }
    ).exec();

    // Then, assign this project to all devices in the devices array
    if (devices.length > 0) {
      await this.callerDeviceModel.updateMany(
        { 
          _id: { $in: devices },
          $or: [{ deleted: false }, { deleted: { $exists: false } }]
        },
        { project: id }
      ).exec();
    }

    // Update the current project with the new devices list
    const updatedProject = await this.projectModel.findOneAndUpdate(
      { 
        _id: id, 
        $or: [{ deleted: false }, { deleted: { $exists: false } }] 
      },
      { devices },
      { new: true }
    ).exec();

    return updatedProject;
  }

  async deleteProject(id: string): Promise<void> {
    const project = await this.projectModel.findOneAndUpdate(
      { 
        _id: id, 
        $or: [{ deleted: false }, { deleted: { $exists: false } }] 
      },
      { deleted: true },
      { new: true }
    ).exec();

    if (!project) {
      throw new NotFoundException('Project not found');
    }
  }

  async updateProjectUsers(id: string, updateProjectUsersDto: UpdateProjectUsersDto): Promise<Project> {
    const { users } = updateProjectUsersDto;
    
    // First, verify the project exists
    const project = await this.projectModel.findOne({ 
      _id: id, 
      $or: [{ deleted: false }, { deleted: { $exists: false } }] 
    }).exec();
    
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Verify all users exist
    for (const userId of users) {
      await this.usersService.findUserById(userId);
    }

    // Update the project with the new users list
    const updatedProject = await this.projectModel.findOneAndUpdate(
      { 
        _id: id, 
        $or: [{ deleted: false }, { deleted: { $exists: false } }] 
      },
      { users },
      { new: true }
    ).exec();

    return updatedProject;
  }
}
