import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  createUser(@Body() createUserDto: CreateUserDto, @Request() req: any) {
    const creatorRole = req.user?.role;
    return this.usersService.createUser(createUserDto, creatorRole);
  }

  @Get()
  findAllUsers(@Request() req: any) {
    const currentUser = req.user as { userId: string; role: string };
    const userId = currentUser?.userId;
    const role = currentUser?.role || 'root';
    return this.usersService.findAllUsersByProject(userId, role);
  }

  @Get(':id')
  findUserById(@Param('id') id: string) {
    return this.usersService.findUserById(id);
  }

  @Patch(':id')
  updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  removeUser(@Param('id') id: string) {
    return this.usersService.removeUser(id);
  }
}

