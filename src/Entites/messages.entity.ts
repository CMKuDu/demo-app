import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  Index,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { MessageReaction } from './messageReaction.entity';
import { Conversation } from './conversation.entity';
import { BaseEntity } from 'src/Base/entity.base';

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  SYSTEM = 'system',
}

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
}

@Entity('messages')
export class Message extends BaseEntity {
  @ManyToOne(() => User, (user) => user.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @OneToMany(() => MessageReaction, (messageUser) => messageUser.messages, {
    onDelete: 'CASCADE',
  })
  reaction: MessageReaction[];
  @ManyToOne(() => Conversation, (conversation) => conversation.messages, {
    onDelete: 'CASCADE',
  })
  conversation?: Conversation;
  @ManyToOne(() => Message, { nullable: true })
  @JoinColumn({ name: 'reply_to_message_id' })
  replyToMessage?: Message;

  @Column({ name: 'sender_id' })
  senderId: string;
  @Column({ name: 'conversation_id' })
  @Index()
  conversationId: string;
  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'enum',
    enum: MessageType,
    default: MessageType.TEXT,
  })
  messageType: MessageType;

  @Column({
    type: 'enum',
    enum: MessageStatus,
    default: MessageStatus.SENT,
  })
  status: MessageStatus;

  @Column({
    type: 'json',
    nullable: true,
    comment: 'File attachments, images, etc.',
  })
  attachments?: {
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
  }[];

  @Column({
    name: 'reply_to_message_id',
    type: 'uuid',
    nullable: true,
  })
  replyToMessageId?: number;

  @Column({
    name: 'edited_at',
    type: 'timestamp',
    nullable: true,
  })
  editedAt?: Date;

  @Column({
    name: 'deleted_at',
    type: 'timestamp',
    nullable: true,
  })
  deletedAt?: Date;

  @Column({
    name: 'read_at',
    type: 'timestamp',
    nullable: true,
  })
  readAt?: Date;

  // Helper methods
  markAsRead(): void {
    this.status = MessageStatus.READ;
    this.readAt = new Date();
  }

  markAsDelivered(): void {
    this.status = MessageStatus.DELIVERED;
  }

  updateStatus(status: MessageStatus): void {
    this.status = status;
    if (status === MessageStatus.READ && !this.readAt) {
      this.readAt = new Date();
    }
  }

  canBeMarkedAsRead(): boolean {
    return this.status !== MessageStatus.READ && !this.isDeleted();
  }

  getStatusDisplay(): string {
    switch (this.status) {
      case MessageStatus.SENT:
        return 'Đã gửi';
      case MessageStatus.DELIVERED:
        return 'Đã nhận';
      case MessageStatus.READ:
        return 'Đã đọc';
      default:
        return 'Không xác định';
    }
  }

  softDelete(): void {
    this.deletedAt = new Date();
  }
  isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  isEdited(): boolean {
    return this.editedAt !== null;
  }
}
