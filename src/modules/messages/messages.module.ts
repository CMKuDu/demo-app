import { forwardRef, Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { MessagesGateway } from './messages.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/Entites/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { Message } from 'src/Entites/messages.entity';

@Module({
  providers: [MessagesService, MessagesGateway],
  controllers: [MessagesController],
  imports: [
    TypeOrmModule.forFeature([User, Message]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
    forwardRef(() => UserModule),
  ],
  exports: [MessagesService, MessagesGateway],
})
export class MessagesModule {}
