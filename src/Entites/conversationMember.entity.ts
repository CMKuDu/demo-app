import { BaseEntity } from 'src/Base/entity.base';
import { Column, Entity, JoinColumn, ManyToOne, Unique, Index } from 'typeorm';
import { User } from './user.entity';
import { Conversation } from './conversation.entity';

export enum MemberRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}

@Entity('conversation_members')
@Unique(['userId', 'conversationId'])
export class ConversationMember extends BaseEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Conversation, (conversation) => conversation.members, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({ name: 'conversation_id' })
  @Index()
  conversationId: string;

  @Column({
    type: 'enum',
    enum: MemberRole,
    default: MemberRole.MEMBER,
  })
  role: MemberRole;

  @Column({
    name: 'last_read_at',
    type: 'timestamp',
    nullable: true,
  })
  lastReadAt?: Date;

  @Column({
    name: 'joined_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  joinedAt: Date;

  @Column({
    name: 'is_muted',
    type: 'boolean',
    default: false,
  })
  isMuted: boolean;

  markAsRead(): void {
    this.lastReadAt = new Date();
  }

  toggleMute(): void {
    this.isMuted = !this.isMuted;
  }
}
