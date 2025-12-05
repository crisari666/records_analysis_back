import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { User, UserDocument } from '../schemas/user.schema';
import { Project, ProjectDocument } from '../schemas/project.schema';
import { Group, GroupDocument } from '../schemas/group.schema';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
    private configService: ConfigService,
  ) {}

  async createUser(createUserDto: CreateUserDto, creatorRole?: string): Promise<User> {
    const { password, projects, ...userData } = createUserDto;
    
    const saltRounds = this.configService.get<number>('bcrypt.rounds');
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // If creator is admin, projects must be provided and user role should be 'user'
    if (creatorRole === 'admin') {
      if (!projects || projects.length === 0) {
        throw new BadRequestException('Projects must be provided when admin creates a user');
      }
      if (userData.role && userData.role !== 'user') {
        throw new BadRequestException('Admin can only create users with role "user"');
      }
      // Verify all projects exist
      for (const projectId of projects) {
        const project = await this.projectModel.findOne({
          _id: projectId,
          $or: [{ deleted: false }, { deleted: { $exists: false } }]
        }).exec();
        if (!project) {
          throw new NotFoundException(`Project with id ${projectId} not found`);
        }
      }
    }

    try {
      const user = new this.userModel({
        ...userData,
        password: hashedPassword,
        projects: projects || [],
      });
      const savedUser = await user.save();

      // If projects are provided, update each project's users array
      if (projects && projects.length > 0) {
        for (const projectId of projects) {
          await this.projectModel.findByIdAndUpdate(
            projectId,
            { $addToSet: { users: savedUser._id.toString() } },
            { new: true }
          ).exec();
        }
      }

      return savedUser;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('User or email already exists');
      }
      throw error;
    }
  }

  async findAllUsers(): Promise<User[]> {
    return this.userModel.find({ removed: false }).select('-password').exec();
  }

  async findAllUsersByProject(userId?: string, role?: string): Promise<User[]> {
    const baseFilter: any = { removed: false };
    
    // If userId is provided, filter by shared projects
    if (userId) {
      const userRole = role || 'root';
      let accessibleProjectIds: string[] = [];

      if (userRole === 'root') {
        // Root users can access all projects, so return all users
        return this.userModel.find(baseFilter).select('-password').exec();
      } else {
        // Get current user's projects
        const currentUser = await this.userModel.findOne({ _id: userId, removed: false }).exec();
        if (!currentUser) {
          return [];
        }
        
        accessibleProjectIds = (currentUser.projects || []).map(p => p.toString());
        
        // If user has no projects, return empty array
        if (accessibleProjectIds.length === 0) {
          return [];
        }
        
        // Filter users to only those who share at least one project with the current user
        baseFilter.projects = { $in: accessibleProjectIds };
      }
    }

    return this.userModel.find(baseFilter).select('-password').exec();
  }

  async findUserById(id: string): Promise<User> {
    const user = await this.userModel.findOne({ _id: id, removed: false }).select('-password').exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findUserByUsernameOrEmail(identifier: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({
      $or: [{ user: identifier }, { email: identifier }],
      removed: false,
    }).exec();
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const updateData: any = { ...updateUserDto };
    
    // Get current user to compare projects
    const currentUser = await this.userModel.findOne({ _id: id, removed: false }).exec();
    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    const currentProjects = (currentUser.projects || []).map(p => p.toString());
    const newProjects = updateData.projects ? updateData.projects.map((p: string) => p.toString()) : currentProjects;
    
    if (updateData.password) {
      const saltRounds = this.configService.get<number>('bcrypt.rounds');
      updateData.password = await bcrypt.hash(updateData.password, saltRounds);
    }

    // Verify all new projects exist
    if (updateData.projects) {
      for (const projectId of updateData.projects) {
        const project = await this.projectModel.findOne({
          _id: projectId,
          $or: [{ deleted: false }, { deleted: { $exists: false } }]
        }).exec();
        if (!project) {
          throw new NotFoundException(`Project with id ${projectId} not found`);
        }
      }
    }

    const user = await this.userModel.findOneAndUpdate(
      { _id: id, removed: false },
      updateData,
      { new: true }
    ).select('-password').exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Handle project changes
    const projectsToAdd = newProjects.filter(p => !currentProjects.includes(p));
    const projectsToRemove = currentProjects.filter(p => !newProjects.includes(p));

    // Add user to new projects
    if (projectsToAdd.length > 0) {
      await this.projectModel.updateMany(
        { _id: { $in: projectsToAdd } },
        { $addToSet: { users: id } }
      ).exec();
    }

    // Remove user from old projects
    if (projectsToRemove.length > 0) {
      await this.projectModel.updateMany(
        { _id: { $in: projectsToRemove } },
        { $pull: { users: id } }
      ).exec();

      // Remove user from groups that belong to projects they're no longer part of
      for (const projectId of projectsToRemove) {
        await this.groupModel.updateMany(
          { projectId, users: id },
          { $pull: { users: id } }
        ).exec();
      }
    }

    return user;
  }

  async removeUser(id: string): Promise<void> {
    const user = await this.userModel.findOneAndUpdate(
      { _id: id, removed: false },
      { removed: true },
      { new: true }
    ).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }
  }

  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
