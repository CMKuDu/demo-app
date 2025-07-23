import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { ResignDTO } from './req/req-resign.dto';
import { ApiResponse } from 'src/classes/api-response.class';
import { LoginDTO } from './req/req-login.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('resign-account')
  async resginAccount(@Body() dto: ResignDTO) {
    const res = await this.authService.resignAccount(dto);
    return new ApiResponse(HttpStatus.OK, 'Succsessfully', res);
  }
  @Post('login-account')
  async loginAccount(@Body() dto: LoginDTO) {
    return await this.authService.loginAccount(dto);
  }
}
