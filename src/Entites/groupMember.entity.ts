import { BaseEntity } from 'src/Base/entity.base';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { User } from './user.entity';
import { Conversation } from './conversation.entity';

export enum MemberRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}

@Entity('group_members')
@Unique(['userId', 'conversationId'])
export class GroupMember extends BaseEntity {
  @Column('uuid')
  userId: string;

  @Column('uuid')
  conversationId: string;

  @Column({
    type: 'enum',
    enum: MemberRole,
    default: MemberRole.MEMBER,
  })
  role: MemberRole;

  @Column({ nullable: true })
  lastReadAt: Date;

  @CreateDateColumn()
  joinedAt: Date;

  @ManyToOne(() => User, (user) => user.groupMemberships, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Conversation, (conversation) => conversation.members, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'conversationId' })
  conversation: Conversation;
}
