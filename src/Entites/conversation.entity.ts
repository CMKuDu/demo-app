import { BaseEntity } from 'src/Base/entity.base';
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Message } from './messages.entity';
import { ConversationMember } from './conversationMember.entity';

export enum ConversationStatus {
  ACTIVE = 'active',
  CLOSED = 'closed',
  PENDING = 'pending',
  ASSIGNED = 'assigned',
}

export enum ConversationType {
  DIRECT = 'direct',
  GROUP = 'group',
}

@Entity('conversations')
export class Conversation extends BaseEntity {
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'creator_id' })
  creator?: User;

  @Column({ name: 'creator_id', nullable: true })
  @Index()
  creatorId?: string;

  @Column({
    type: 'enum',
    enum: ConversationStatus,
    default: ConversationStatus.ACTIVE,
  })
  @Index()
  status: ConversationStatus;

  @Column({
    name: 'name',
    type: 'varchar',
    nullable: true, // Direct chat không cần tên
  })
  name?: string;

  @Column({
    name: 'description',
    type: 'text',
    nullable: true,
  })
  description?: string;

  @Column({
    name: 'avatar',
    type: 'varchar',
    nullable: true,
  })
  avatar?: string;

  @Column({
    type: 'enum',
    enum: ConversationType,
    default: ConversationType.DIRECT,
  })
  type: ConversationType;

  @Column({
    name: 'last_message_at',
    type: 'timestamp',
    nullable: true,
  })
  lastMessageAt?: Date;

  // Relations
  @OneToMany(() => Message, (message) => message.conversation, {
    cascade: true,
  })
  messages: Message[];

  @OneToMany(() => ConversationMember, (member) => member.conversation, {
    cascade: true,
  })
  members: ConversationMember[];

  // Helper methods
  updateLastMessageTime(): void {
    this.lastMessageAt = new Date();
  }

  isDirectMessage(): boolean {
    return this.type === ConversationType.DIRECT;
  }

  isGroupChat(): boolean {
    return this.type === ConversationType.GROUP;
  }
}
