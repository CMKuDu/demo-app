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
import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { SendMessageDTO } from './dto/send-message.dto';
import {
  IMessageService,
  IMessageServiceToken,
} from './interface/message.interface';
import {
  IMessageReactionService,
  IMessageReactionToken,
} from '../message-reaction/interface/message-reaction.interface';
import {
  IConversationService,
  IConversationToken,
} from '../conversation/interface/conversation.interface';

export enum EventMessages {
  CONNECTION_SUCCESS = 'connection_success',
  CONNECTION_ERROR = 'connection_error',
  USER_ONLINE = 'user_online',
  USER_OFFLINE = 'user_offline',
  NEW_CONVERSATION = 'new_conversation',
  JOIN_CONVERSATION = 'join_conversation',
  LEAVE_CONVERSATION = 'leave_conversation',
  SEND_MESSAGE = 'send_message',
  NEW_MESSAGE = 'new_message',
  MESSAGE_ERROR = 'message_error',
  MARK_AS_READ = 'mark_as_read',
  MESSAGE_READ = 'message_read',
  USER_REACTION_MESSAGE = 'reaction_message',
  TYPING_START = 'typing_start',
  TYPING_STOP = 'typing_stop',
  USER_TYPING = 'user_typing',
}

@Injectable()
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/messages',
})
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  private readonly userConnections = new Map<string, Set<string>>();
  private readonly socketUsers = new Map<
    string,
    { userId: string; userName: string }
  >();
  private typingTimeouts = new Map<string, NodeJS.Timeout>();
  private readonly lastSeen = new Map<string, Date>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    @Inject(IMessageServiceToken)
    private readonly messageService: IMessageService,
    @Inject(IMessageReactionToken)
    private readonly messageReactionService: IMessageReactionService,
    @Inject(IConversationToken)
    private readonly conversationService: IConversationService,
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
        userName: user.userName,
      });

      const userKey = userInfo.userId.toString();
      if (!this.userConnections.has(userKey)) {
        this.userConnections.set(userKey, new Set());
      }
      this.userConnections.get(userKey)?.add(client.id);

      const conversations =
        await this.conversationService.getUserConversations(userKey);
      conversations.forEach((c) => client.join(`conversation_${c.id}`));

      client.emit(EventMessages.CONNECTION_SUCCESS, {
        message: 'Connected successfully',
        userId: userInfo.userId,
        userName: user.userName,
      });

      this.server.emit(EventMessages.USER_ONLINE, {
        userId: userInfo.userId,
        userName: user.userName,
      });
    } catch (error) {
      console.log('[WebSocket] Connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    const userInfo = this.socketUsers.get(client.id);
    if (!userInfo) return;

    const { userId, userName } = userInfo;
    const userKey = userId.toString();

    this.userConnections.get(userKey)?.delete(client.id);
    if (this.userConnections.get(userKey)?.size === 0) {
      this.userConnections.delete(userKey);
      this.lastSeen.set(userId, new Date());
    }

    this.server.emit(EventMessages.USER_OFFLINE, {
      userId,
      userName,
      lastSeen: this.lastSeen.get(userId),
    });

    this.socketUsers.delete(client.id);
  }

  @SubscribeMessage(EventMessages.JOIN_CONVERSATION)
  joinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string },
  ) {
    const { room } = this.getClientContext(client, payload.conversationId);
    if (!room) return;
    client.join(room);
    this.server.to(room).emit(EventMessages.JOIN_CONVERSATION, {
      userId: this.socketUsers.get(client.id)?.userId,
    });
  }

  @SubscribeMessage(EventMessages.LEAVE_CONVERSATION)
  leaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string },
  ) {
    const { room } = this.getClientContext(client, payload.conversationId);
    if (!room) return;
    client.leave(room);
    this.server.to(room).emit(EventMessages.LEAVE_CONVERSATION, {
      userId: this.socketUsers.get(client.id)?.userId,
    });
  }

  @SubscribeMessage(EventMessages.SEND_MESSAGE)
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SendMessageDTO,
  ) {
    const { userInfo, room } = this.getClientContext(
      client,
      payload.conversationId,
    );
    if (!userInfo || !room) return;

    if (!payload.content) {
      client.emit(EventMessages.MESSAGE_ERROR, 'Content is required');
      return;
    }

    try {
      const message = await this.messageService.sendMessage(
        payload,
        userInfo.userId,
      );
      this.server.to(room).emit(EventMessages.NEW_MESSAGE, message);
    } catch (err) {
      client.emit(EventMessages.MESSAGE_ERROR, 'Error sending message');
    }
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
    this.server.to(room).emit(EventMessages.USER_TYPING, {
      userId: userInfo.userId,
      typing: true,
    });
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
    if (this.typingTimeouts.has(key)) {
      clearTimeout(this.typingTimeouts.get(key)!);
      this.typingTimeouts.delete(key);
    }
    this.server.to(room).emit(EventMessages.USER_TYPING, {
      userId: userInfo.userId,
      typing: false,
    });
  }

  /** ✅ REACTION_MESSAGE */
  @SubscribeMessage(EventMessages.USER_REACTION_MESSAGE)
  async handleReactionMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      message_id: number;
      user_id: number;
      emoji: string;
      conversationId: string;
    },
  ) {
    const { room } = this.getClientContext(client, payload.conversationId);
    if (!room) return;

    try {
      await this.messageReactionService.reactionMessage(payload);
      this.server.to(room).emit(EventMessages.USER_REACTION_MESSAGE, payload);
    } catch (error) {
      client.emit(EventMessages.MESSAGE_ERROR, 'Error reacting to message');
    }
  }

  /** ✅ MARK_AS_READ */
  // @SubscribeMessage(EventMessages.MARK_AS_READ)
  // async handleMarkAsRead(
  //   @ConnectedSocket() client: Socket,
  //   @MessageBody() payload: { conversationId: string; messageId: number },
  // ) {
  //   const { userInfo, room } = this.getClientContext(client, payload.conversationId);
  //   if (!userInfo || !room) return;

  //   await this.messageService.markAsRead(payload.messageId, userInfo.userId);
  //   this.server.to(room).emit(EventMessages.MESSAGE_READ, {
  //     messageId: payload.messageId,
  //     userId: userInfo.userId,
  //   });
  // }

  private getClientContext(client: Socket, conversationId?: string) {
    const userInfo = this.socketUsers.get(client.id) || null;
    if (!userInfo) return { userInfo: null };
    if (!conversationId) return { userInfo };
    const room = `conversation_${conversationId}`;
    const key = `${room}_${userInfo.userId}`;
    return { userInfo, room, key };
  }

  private setTypingTimeout(room: string, userId: string, key: string) {
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
