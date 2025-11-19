import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Group, GroupDocument } from '../schemas/group.schema';
import { Project, ProjectDocument } from '../schemas/project.schema';
import { CreateGroupDto } from '../dto/create-group.dto';
import { UpdateGroupDto } from '../dto/update-group.dto';
import { UpdateGroupUsersDto } from '../dto/update-group-users.dto';

@Injectable()
export class GroupsService {
  constructor(
    @InjectModel(Group.name) private readonly groupModel: Model<GroupDocument>,
    @InjectModel(Project.name) private readonly projectModel: Model<ProjectDocument>,
  ) {}

  async createGroup(createGroupDto: CreateGroupDto): Promise<Group> {
    const group = new this.groupModel({ ...createGroupDto, deleted: false });
    return group.save();
  }

  async findAllGroups(projectId?: string): Promise<Group[]> {
    const baseFilter: any = { $or: [{ deleted: false }, { deleted: { $exists: false } }] };
    if (projectId) {
      baseFilter.projectId = projectId;
    }
    return this.groupModel.find(baseFilter).exec();
  }

  async findGroupById(id: string): Promise<Group> {
    const group = await this.groupModel.findOne({ _id: id, $or: [{ deleted: false }, { deleted: { $exists: false } }] }).exec();
    if (!group) {
      throw new NotFoundException('Group not found');
    }
    return group;
  }

  async updateGroup(id: string, updateGroupDto: UpdateGroupDto): Promise<Group> {
    const group = await this.groupModel.findOneAndUpdate(
      { _id: id, $or: [{ deleted: false }, { deleted: { $exists: false } }] },
      { $set: updateGroupDto },
      { new: true },
    ).exec();
    if (!group) {
      throw new NotFoundException('Group not found');
    }
    return group;
  }

  async updateGroupUsers(id: string, dto: UpdateGroupUsersDto): Promise<Group> {
    const group = await this.groupModel.findOneAndUpdate(
      { _id: id, $or: [{ deleted: false }, { deleted: { $exists: false } }] },
      { $set: { users: dto.users } },
      { new: true },
    ).exec();
    if (!group) {
      throw new NotFoundException('Group not found');
    }
    return group;
  }

  async deleteGroup(id: string): Promise<void> {
    const group = await this.groupModel.findOneAndUpdate(
      { _id: id, $or: [{ deleted: false }, { deleted: { $exists: false } }] },
      { $set: { deleted: true } },
      { new: true },
    ).exec();
    if (!group) {
      throw new NotFoundException('Group not found');
    }
  }

  async getProjectByGroupId(id: string): Promise<Project> {
    const group = await this.groupModel.findOne({ 
      _id: id, 
      $or: [{ deleted: false }, { deleted: { $exists: false } }] 
    }).exec();
    
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const project = await this.projectModel.findOne({ 
      _id: group.projectId, 
      $or: [{ deleted: false }, { deleted: { $exists: false } }] 
    }).exec();
    
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    
    return project;
  }
}


