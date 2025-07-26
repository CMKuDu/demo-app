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
import { userInfo } from 'os';
export enum EventMessages {
  // Message events
  NOTIFICATION_NEW_MESSAGE = 'notification_new_message',
  SEND_MESSAGE = 'send_message',
  NEW_MESSAGE = 'new_message',
  MESSAGE_SENT = 'message_sent',
  MESSAGE_ERROR = 'message_error',

  //Converstion events
  NEW_CONVERSATION = 'new_conversation',
  NEW_UNASSIGNED_CONVERSATION = 'new_unassigned_conversation',
  CONVERSATION_ASSIGNED = 'conversation_assigned',
  CONVERSATION_CLOSED = 'conversation_closed',
  JOIN_CONVERSATION = 'join_conversation',
  LEAVE_CONVERSATION = 'leave_conversation',

  // Real-time Indicators
  TYPING_START = 'typing_start',
  TYPING_STOP = 'typing_stop',
  USER_TYPING = 'user_typing',
  MARK_AS_READ = 'mark_as_read',
  MESSAGE_READ = 'message_read',

  // User status events
  USER_ONLINE = 'user_online',
  USER_OFFLINE = 'user_offline',
  CSKH_STATUS_CHANGED = 'cskh_status_changed',

  // System Events
  CONNECTION_SUCCESS = 'connection_success',
  CONNECTION_ERROR = 'connection_error',
  CONVERSATION_STATS_UPDATE = 'conversation_stats_update',
  NOTIFICATION = 'notification',

  //
  JOIN_SYSTEM_USER_ROOM = 'join_system_user_room',
  JOINED_SYSTEM_USER_ROOM = 'joined_system_user_room',
  LEAVE_SYSTEM_USER_ROOM = 'leave_system_user_room',
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
  private readonly userConnections = new Map<string, Set<string>>(); // userId -> Set of socketIds
  private readonly socketUsers = new Map<
    string,
    {
      userId: number;
      userType: 'user' | 'system';
      userName: string;
      email: string;
    }
  >(); // socketId -> user info
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly messageService: MessagesService,
  ) {}

  async handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
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
      if (!userInfo || !userInfo.userId) {
        client.emit(EventMessages.CONNECTION_ERROR, 'Invalid token');
        client.disconnect();
        return;
      }
      const userId = userInfo.userId;
      const userType = userInfo.userType || 'user'; // Default to 'user'
      const user = await this.userService.getUserById(userId);
      if (!user) {
        client.emit(EventMessages.CONNECTION_ERROR, 'User not found');
        client.disconnect();
        return;
      }
      const userKey = userId.toString();

      // Store user info
      this.socketUsers.set(client.id, {
        userId,
        userType,
        userName: user.userName,
        email: user.email!,
      });

      if (!this.userConnections.has(userKey)) {
        this.userConnections.set(userKey, new Set());
      }
      this.userConnections.get(userKey)?.add(client.id);

      client.emit(EventMessages.CONNECTION_SUCCESS, {
        message: 'Connected successfully',
        userId,
        userName: user.userName,
      });

      this.server.emit(EventMessages.USER_ONLINE, {
        userId,
        userName: user.userName,
        timestamp: new Date(),
      });
      client.emit(EventMessages.CONNECTION_SUCCESS, 'Connected successfully');
    } catch (error) {
      console.log('[WebSocket] Error during connection:', error);
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
      // Broadcast user offline status
      this.server.emit(EventMessages.USER_OFFLINE, {
        userId,
        userName,
        timestamp: new Date(),
      });
      this.socketUsers.delete(client.id);
      console.log('Client disconnected:', client.id);
      client.emit(EventMessages.CONNECTION_ERROR, 'Disconnected');
    }
  }
  // Join conversation room
  @SubscribeMessage(EventMessages.JOIN_CONVERSATION)
  joinConverSationRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string },
  ) {
    const conversationRoom = payload.conversationId;
    client.join(conversationRoom);
    console.log(
      `Socket ${client.id} joined conversation room: ${conversationRoom}`,
    );
    client.emit(EventMessages.JOIN_CONVERSATION);
  }
  // Leave conversation room
  @SubscribeMessage(EventMessages.LEAVE_CONVERSATION)
  leaveConversationRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string },
  ) {
    const conversationRoom = payload.conversationId;
    client.leave(conversationRoom);
    console.log(
      `Socket ${client.id} left conversation room: ${conversationRoom}`,
    );
    client.emit(EventMessages.LEAVE_CONVERSATION);
  }
  @SubscribeMessage(EventMessages.SEND_MESSAGE)
  async handlerSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SendMessageDTO,
  ) {
    try {
      const userInfo = this.socketUsers.get(client.id);
      if (!userInfo) {
        client.emit(EventMessages.MESSAGE_ERROR, 'User not found');
        return;
      }
      if (!payload || !payload.content) {
        client.emit(EventMessages.MESSAGE_ERROR, 'Message content is required');
        return;
      }
      const message = await this.messageService.sendMessage(
        payload,
        userInfo.userId.toString(),
      );
      if (!message) {
        client.emit(EventMessages.MESSAGE_ERROR, 'Failed to send message');
        return;
      }
      client.emit(EventMessages.SEND_MESSAGE, message);
      this.server
        .to(`conversation_${payload.conversationId}`)
        .emit(EventMessages.NEW_MESSAGE, {
          ...message,
          conversationId: payload.conversationId,
        });
      // this.sendNotificationToOfflineUsers(
      //   data.conversationId,
      //   message,
      //   userInfo.userId,
      // );
    } catch (error) {
      console.log('[WebSocket] Error sending message:', error);
      client.emit(EventMessages.MESSAGE_ERROR, 'Error sending message');
    }
  }
}
