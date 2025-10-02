import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { AuthDto } from '../dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(identifier: string, password: string): Promise<any> {
    const user = await this.usersService.findUserByUsernameOrEmail(identifier);
    const isPasswordValid = await this.usersService.validatePassword(password, user.password);
    
    if (isPasswordValid) {
      const userObj = user.toObject();
      const { password: _, ...result } = userObj;
      return result;
    }
    return null;
  }

  async login(authDto: AuthDto) {
    const user = await this.validateUser(authDto.identifier, authDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { 
      sub: user._id, 
      username: user.user, 
      email: user.email 
    };

    const jwtConfig = this.configService.get('jwt');
    const accessToken = this.jwtService.sign(payload, {
      privateKey: jwtConfig.privateKey,
      algorithm: jwtConfig.algorithm,
      expiresIn: jwtConfig.expiresIn,
    });
    
    return {
      access_token: accessToken,
      user: {
        id: user._id,
        name: user.name,
        lastName: user.lastName,
        user: user.user,
        email: user.email,
      },
    };
  }
}

