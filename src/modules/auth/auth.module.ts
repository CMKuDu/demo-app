import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { TokenModule } from '../token/token.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [AuthService],
  controllers: [AuthController],
  imports: [UserModule, TokenModule, ConfigModule],
})
export class AuthModule {}
