import { Controller, Post, Body, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { AuthDto } from '../dto/auth.dto';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  login(@Body() authDto: AuthDto) {
    return this.authService.login(authDto);
  }

  @Get('me')
  async me(@Req() req: Request) {
    const userFromToken = req['user'] as { userId: string; username: string; email: string; role: string };
    const fullUser = await this.usersService.findUserById(userFromToken.userId);

    console.log(fullUser);
    
    const userRole = fullUser.role || 'root';
    const token = this.extractTokenFromHeader(req);
    
    return {
      access_token: token,
      user: {
        id: (fullUser as any)._id,
        name: fullUser.name,
        lastName: fullUser.lastName,
        user: fullUser.user,
        email: fullUser.email,
        role: userRole,
      },
    };
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

