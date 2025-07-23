import { forwardRef, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from '../user/user.service';
import { TokenService } from '../token/token.service';
import { LoginDTO } from './req/req-login.dto';
import { ResignDTO } from './req/req-resign.dto';
import { throwError } from 'rxjs';
import { ApiErrorException } from 'src/exceptions/api-error.exception';
import { User } from 'src/Entites/user.entity';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => TokenService))
    private readonly tokenService: TokenService,
    @Inject(forwardRef(() => ConfigService))
    private readonly configService: ConfigService,
  ) {}
  async resignAccount(dto: ResignDTO) {
    await this.validateResignInput(dto);

    // const find = await this.isEmailAvailable(dto.email);
    // if (!find) {
    //   throw new ApiErrorException('User đã tồn tại', HttpStatus.CONFLICT);
    // }
    console.log(dto.password);

    const pwdHash = await this.hashPwd(dto.password);
    const newUser = await this.mapDtoToUser(dto, pwdHash);
    console.log(newUser);

    const saveUser = await this.userService.saveUser(newUser);
    return {
      message: 'Đăng ký thành công',
      userId: saveUser.id,
      userName: saveUser.userName,
    };
  }
  async loginAccount(dto: LoginDTO) {
    this.validateLoginInput(dto);
    const user = await this.userService.getUserEmail(dto.email);
    if (!user) {
      throw new ApiErrorException(
        'Sai tài khoảng hoặc mặt khẩu',
        HttpStatus.BAD_REQUEST,
      );
    }
    const secretPwd = dto.password + this.configService.get<string>('SECRET');
    const isPasswordValid = await bcrypt.compare(secretPwd, user.passWord);

    if (!isPasswordValid) {
      throw new ApiErrorException(
        'Mặt khẩu không đúng',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const [accessToken, refreshToken] = await this.tokenService.generateToken({
      payload: {
        sub: {
          id: user.id,
        },
      },
    });
    return {
      token: { accessToken, refreshToken },
      info: {
        user,
        userName: user.userName,
        email: user.email,
      },
    };
  }

  private validateResignInput(dto: any): void {
    const errors: string[] = [];

    if (!dto.email?.trim()) {
      errors.push('Email không được để trống');
    }

    if (!dto.password?.trim()) {
      errors.push('Mật khẩu không được để trống');
    }

    if (!dto.userName?.trim()) {
      errors.push('Tên đăng nhập không được để trống');
    }

    if (dto.email && !this.isValidEmail(dto.email)) {
      errors.push('Email không đúng định dạng');
    }

    if (dto.password && !this.isValidPassword(dto.password)) {
      errors.push('Mật khẩu phải có ít nhất 6 ký tự');
    }
    if (dto.password !== dto.rePassword) {
      errors.push('Mật khẩu nhập lại không khớp');
    }

    if (errors.length > 0) {
      throw new ApiErrorException(errors.join(', '), HttpStatus.BAD_REQUEST);
    }
  }
  private validateLoginInput(dto: LoginDTO): void {
    const errors: string[] = [];

    if (!dto.email?.trim()) {
      errors.push('Email không được để trống');
    }

    if (!dto.password?.trim()) {
      errors.push('Mật khẩu không được để trống');
    }

    if (dto.email && !this.isValidEmail(dto.email)) {
      errors.push('Email không đúng định dạng');
    }

    if (errors.length > 0) {
      throw new ApiErrorException(errors.join(', '), HttpStatus.BAD_REQUEST);
    }
  }

  private async isEmailAvailable(email: string): Promise<boolean> {
    const find = await this.userService.getUserEmail(email);
    if (find) return false;
    return true;
  }
  private isValidEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
  private isValidPassword(password: string): boolean {
    // At least 6 characters, you can add more rules
    return password.length >= 6;
  }
  private mapDtoToUser(dto: ResignDTO, hashedPassword: string): Partial<User> {
    const { password, ...rest } = dto;
    return {
      ...rest,
      passWord: hashedPassword,
    };
  }
  private async hashPwd(pwd: string): Promise<string> {
    const SECRET = this.configService.get<string>('SECRET');
    const SALT_ROUNDS = this.configService.get<string>('SALT_ROUNDS');
    const secretPwd = pwd + SECRET;
    return await bcrypt.hash(secretPwd, Number(SALT_ROUNDS));
  }
}
