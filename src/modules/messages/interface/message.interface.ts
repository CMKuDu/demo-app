import { Message } from 'src/Entites/messages.entity';
import { SendMessageDTO } from '../dto/send-message.dto';

export const IMessageServiceToken = 'IMessageService'; // Injection Token
export interface IMessageService {
  sendMessage(payload: SendMessageDTO,senderId: string): Promise<Message | void>;
}
