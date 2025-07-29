import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './Entites/user.entity';
import { HttpModule } from '@nestjs/axios';
import { Message } from './Entites/messages.entity';
import { MessageReaction } from './Entites/messageReaction.entity';
import { Conversation } from './Entites/conversation.entity';
import { ConversationMember } from './Entites/conversationMember.entity';
import { MessagesModule } from './modules/messages/messages.module';
import { AuthModule } from './modules/auth/auth.module';
import { RenderModule } from './modules/render/render.module';
import { ConversationModule } from './modules/conversation/conversation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('DB_HOST');
        const port = configService.get<string>('DB_PORT');
        const username = configService.get<string>('DB_USERNAME');
        const password = configService.get<string>('DB_PASSWORD');
        const database = configService.get<string>('DB_DATABASE');

        const url = `postgres://${username}:${password}@${host}:${port}/${database}`;
        return {
          // type: 'mysql',
          type: 'postgres',
          url,
          entities: [
            User,
            Message,
            MessageReaction,
            ConversationMember,
            Conversation,
          ],
          synchronize: configService.get<string>('DB_SYNC') === 'true',
          autoLoadEntities: true,
          ssl: {
            rejectUnauthorized: false, // BẮT BUỘC CHO SUPABASE
          },
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
    AuthModule,
    RenderModule,
    ConversationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
