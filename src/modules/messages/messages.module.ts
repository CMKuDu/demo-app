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
import { MessageReaction } from 'src/Entites/messageReaction.entity';
import { MessageReactionModule } from '../message-reaction/message-reaction.module';
import {
  IMessageService,
  IMessageServiceToken,
} from './interface/message.interface';
import { HelperService } from '../helper/Helper';
import { ConversationModule } from '../conversation/conversation.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Message, MessageReaction]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
    forwardRef(() => UserModule),
    forwardRef(() => MessageReactionModule),
    forwardRef(() => ConversationModule),
  ],
  providers: [
    MessagesGateway,
    MessagesService,
    HelperService,
    {
      provide: IMessageServiceToken, // Token
      useClass: MessagesService, // Implementation
    },
  ],
  controllers: [MessagesController],
  exports: [IMessageServiceToken],
})
export class MessagesModule {}
