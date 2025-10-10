import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectDocument } from '../schemas/project.schema';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { UpdateProjectDevicesDto } from '../dto/update-project-devices.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
  ) {}

  async createProject(createProjectDto: CreateProjectDto): Promise<Project> {
    const project = new this.projectModel(createProjectDto);
    return await project.save();
  }

  async findAllProjects(): Promise<Project[]> {
    return this.projectModel.find({ 
      $or: [{ deleted: false }, { deleted: { $exists: false } }] 
    }).exec();
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
}
