import { MessageReaction } from 'src/Entites/messageReaction.entity';

export const IMessageReactionToken = 'IMessageReactionService';
export interface IMessageReactionService {
  reactionMessage(payload: {
    message_id: number;
    user_id: number;
    emoji: string;
    conversationId: string;
  }): Promise<MessageReaction | null>;
}
