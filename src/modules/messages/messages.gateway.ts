import { Injectable } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MessagesService } from './messages.service';
import { SendMessageDTO } from './dto/send-message.dto';

export enum EventMessages {
  NOTIFICATION_NEW_MESSAGE = 'notification_new_message',
  SEND_MESSAGE = 'send_message',
  NEW_MESSAGE = 'new_message',
  MESSAGE_SENT = 'message_sent',
  MESSAGE_ERROR = 'message_error',
  NEW_CONVERSATION = 'new_conversation',
  JOIN_CONVERSATION = 'join_conversation',
  LEAVE_CONVERSATION = 'leave_conversation',
  TYPING_START = 'typing_start',
  TYPING_STOP = 'typing_stop',
  USER_TYPING = 'user_typing',
  MARK_AS_READ = 'mark_as_read',
  MESSAGE_READ = 'message_read',
  USER_ONLINE = 'user_online',
  USER_OFFLINE = 'user_offline',
  CONNECTION_SUCCESS = 'connection_success',
  CONNECTION_ERROR = 'connection_error',
}

@Injectable()
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/messages',
})
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly userConnections = new Map<string, Set<string>>();
  private readonly socketUsers = new Map<
    string,
    {
      userId: number;
      userType: 'user' | 'system';
      userName: string;
      email: string;
    }
  >();
  private typingTimeouts = new Map<string, NodeJS.Timeout>();

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly messageService: MessagesService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token as string;
      if (!token) {
        client.emit(EventMessages.CONNECTION_ERROR, 'No token provided');
        client.disconnect();
        return;
      }

      const userInfo = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      if (!userInfo?.userId) {
        client.emit(EventMessages.CONNECTION_ERROR, 'Invalid token');
        client.disconnect();
        return;
      }

      const user = await this.userService.getUserById(userInfo.userId);
      if (!user) {
        client.emit(EventMessages.CONNECTION_ERROR, 'User not found');
        client.disconnect();
        return;
      }

      this.socketUsers.set(client.id, {
        userId: userInfo.userId,
        userType: userInfo.userType || 'user',
        userName: user.userName,
        email: user.email!,
      });

      const userKey = userInfo.userId.toString();
      if (!this.userConnections.has(userKey)) {
        this.userConnections.set(userKey, new Set());
      }
      this.userConnections.get(userKey)?.add(client.id);

      client.emit(EventMessages.CONNECTION_SUCCESS, {
        message: 'Connected successfully',
        userId: userInfo.userId,
        userName: user.userName,
      });

      this.server.emit(EventMessages.USER_ONLINE, {
        userId: userInfo.userId,
        userName: user.userName,
        timestamp: new Date(),
      });
    } catch (error) {
      console.log('[WebSocket] Connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    const userInfo = this.socketUsers.get(client.id);
    if (userInfo) {
      const { userId, userName } = userInfo;
      const userKey = userId.toString();

      this.userConnections.get(userKey)?.delete(client.id);
      if (this.userConnections.get(userKey)?.size === 0) {
        this.userConnections.delete(userKey);
      }

      this.server.emit(EventMessages.USER_OFFLINE, {
        userId,
        userName,
        timestamp: new Date(),
      });

      this.socketUsers.delete(client.id);
      client.emit(EventMessages.CONNECTION_ERROR, 'Disconnected');
    }
  }

  private getClientContext(
    client: Socket,
    conversationId?: string,
  ): {
    userInfo: { userId: number; userName: string } | null;
    room?: string;
    key?: string;
  } {
    const userInfo = this.socketUsers.get(client.id) || null;
    if (!userInfo) return { userInfo: null };

    if (!conversationId) return { userInfo };

    const room = `conversation_${conversationId}`;
    const key = `${room}_${userInfo.userId}`;
    return { userInfo, room, key };
  }

  @SubscribeMessage(EventMessages.JOIN_CONVERSATION)
  joinConversationRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string },
  ) {
    const { room } = this.getClientContext(client, payload.conversationId);
    if (!room) return;

    client.join(room);
    console.log(`Socket ${client.id} joined room: ${room}`);
    client.to(room).emit(EventMessages.JOIN_CONVERSATION);
  }

  @SubscribeMessage(EventMessages.TYPING_START)
  typingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string },
  ) {
    const { userInfo, room, key } = this.getClientContext(
      client,
      payload.conversationId,
    );
    if (!userInfo || !room) return;
    if (!client.rooms.has(room)) return;

    this.emitTyping(room, userInfo, true);
    this.setTypingTimeout(room, userInfo.userId, key!);
  }

  @SubscribeMessage(EventMessages.TYPING_STOP)
  typingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string },
  ) {
    const { userInfo, room, key } = this.getClientContext(
      client,
      payload.conversationId,
    );
    if (!userInfo || !room || !key) return;

    this.emitTyping(room, userInfo, false);

    if (this.typingTimeouts.has(key)) {
      clearTimeout(this.typingTimeouts.get(key)!);
      this.typingTimeouts.delete(key);
    }
  }

  @SubscribeMessage(EventMessages.SEND_MESSAGE)
  async handlerSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SendMessageDTO,
  ) {
    const { userInfo, room } = this.getClientContext(
      client,
      payload.conversationId,
    );
    if (!userInfo || !room) {
      client.emit(EventMessages.MESSAGE_ERROR, 'Invalid user or room');
      return;
    }

    if (!payload.content) {
      client.emit(EventMessages.MESSAGE_ERROR, 'Message content is required');
      return;
    }

    try {
      const message = await this.messageService.sendMessage(
        payload,
        userInfo.userId.toString(),
      );
      client.emit(EventMessages.SEND_MESSAGE, message);
      this.server.to(room).emit(EventMessages.NEW_MESSAGE, {
        ...message,
        conversationId: payload.conversationId,
      });
    } catch (error) {
      client.emit(EventMessages.MESSAGE_ERROR, 'Error sending message');
    }
  }

  private emitTyping(room: string, userInfo: any, typing: boolean) {
    this.server.to(room).emit(EventMessages.USER_TYPING, {
      userId: userInfo.userId,
      userName: userInfo.userName,
      typing,
    });
  }

  private setTypingTimeout(room: string, userId: number, key: string) {
    if (this.typingTimeouts.has(key)) {
      clearTimeout(this.typingTimeouts.get(key)!);
    }
    this.typingTimeouts.set(
      key,
      setTimeout(() => {
        this.server.to(room).emit(EventMessages.USER_TYPING, {
          userId,
          typing: false,
        });
        this.typingTimeouts.delete(key);
      }, 5000),
    );
  }
}
