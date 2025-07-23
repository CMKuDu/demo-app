import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { UserController } from './modules/user/user.controller';
import { UserService } from './modules/user/user.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './Entites/user.entity';
import { HttpModule } from '@nestjs/axios';
import { Message } from './Entites/messages.entity';
import { MessageReaction } from './Entites/messageReaction.entity';
import { GroupMember } from './Entites/groupMember.entity';
import { Conversation } from './Entites/conversation.entity';
import { ConversationMember } from './Entites/conversationMember.entity';
import { MessagesModule } from './modules/messages/messages.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'mysql',
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_DATABASE'),
          entities: [
            User,
            Message,
            MessageReaction,
            GroupMember,
            ConversationMember,
            Conversation,
          ],
          synchronize: configService.get<boolean>('DB_SYNC'),
        };
      },
    }),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
      headers: {
        'Content-Type': 'application/json',
      },
    }),
    UserModule,
    MessagesModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
