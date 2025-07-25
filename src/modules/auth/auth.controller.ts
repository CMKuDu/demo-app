import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { ResignDTO } from './req/req-resign.dto';
import { ApiResponse } from 'src/classes/api-response.class';
import { LoginDTO } from './req/req-login.dto';
import { COOKIE_KEY } from 'src/constants';
import { Response } from 'express';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register-account')
  async registerAccount(@Body() dto: ResignDTO) {
    const res = await this.authService.registerAccount(dto);
    return new ApiResponse(HttpStatus.OK, 'Succsessfully', res);
  }
  @Post('login-account')
  async loginAccount(@Body() dto: LoginDTO, @Res() res: Response) {
    const result = await this.authService.loginAccount(dto);
    return res
      .cookie(COOKIE_KEY.REFRESH_TOKEN, result.token.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .json(new ApiResponse(HttpStatus.OK, 'Login successful', result));
  }
}
