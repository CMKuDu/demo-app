import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { CreateToken } from './dto/create-token.dto';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  generateToken<T>(data: CreateToken<T>): string[] {
    const accessToken = this.jwtService.sign(data.payload || {}, {
      ...data.options,
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '1h',
    });
    const refreshToken = this.jwtService.sign(data.payload || {}, {
      ...data.options,
      expiresIn:
        this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d',
    });
    return [accessToken, refreshToken];
  }
  verifyToken(token: string): any {
    return this.jwtService.verify(token);
  }
  refreshToken(token: string) {
    const decode = this.verifyToken(token);
    const [accessToken, refreshToken] = this.generateToken({
      payload: { sub: decode.sub },
    });
    return { accessToken, refreshToken };
  }
}
