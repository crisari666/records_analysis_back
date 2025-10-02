import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { User, UserDocument } from '../schemas/user.schema';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private configService: ConfigService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { password, ...userData } = createUserDto;
    
    const saltRounds = this.configService.get<number>('bcrypt.rounds');
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    try {
      const user = new this.userModel({
        ...userData,
        password: hashedPassword,
      });
      return await user.save();
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
    
    if (updateData.password) {
      const saltRounds = this.configService.get<number>('bcrypt.rounds');
      updateData.password = await bcrypt.hash(updateData.password, saltRounds);
    }

    const user = await this.userModel.findOneAndUpdate(
      { _id: id, removed: false },
      updateData,
      { new: true }
    ).select('-password').exec();

    if (!user) {
      throw new NotFoundException('User not found');
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
