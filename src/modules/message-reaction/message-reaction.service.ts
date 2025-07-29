import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageReaction } from 'src/Entites/messageReaction.entity';
import { Repository } from 'typeorm';
import { IMessageReactionService } from './interface/message-reaction.interface';

@Injectable()
export class MessageReactionService implements IMessageReactionService {
  constructor(
    @InjectRepository(MessageReaction)
    private readonly messageReactionRepository: Repository<MessageReaction>,
  ) {}
  async reactionMessage(payload: {
    message_id: number;
    user_id: number;
    emoji: string;
    conversationId: string;
  }): Promise<MessageReaction | null> {
    const existingReaction = await this.messageReactionRepository.findOne({
      where: {
        user: { id: payload.user_id },
        messages: { id: payload.message_id },
        emoji: payload.emoji,
      },
    });
    if (existingReaction) {
      await this.messageReactionRepository.remove(existingReaction);
      return null;
    }
    const entity = this.messageReactionRepository.create({
      emoji: payload.emoji,
      user: { id: payload.user_id },
      messages: { id: payload.message_id },
    });
    return await this.messageReactionRepository.save(entity);
  }
}
