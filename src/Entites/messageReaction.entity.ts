import { BaseEntity } from 'src/Base/entity.base';
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { User } from './user.entity';
import { Message } from './messages.entity';
@Entity('message_reactions')
@Unique(['user', 'messages', 'emoji'])
export class MessageReaction extends BaseEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
  @ManyToOne(() => Message, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'message_id' })
  messages: Message;

  @Column({
    type: 'varchar',
    name: 'emoji',
  })
  emoji: string;
}
