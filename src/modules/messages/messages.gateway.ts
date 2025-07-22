import { Injectable } from '@nestjs/common';
import {
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
    { userId: number; userType: 'user' | 'system' }
  >(); // socketId -> user info
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  handleConnection(client: Socket): void {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket): void {
    console.log('Client disconnected:', client.id);
  }
}
