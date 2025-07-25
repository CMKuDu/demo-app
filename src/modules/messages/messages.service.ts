import { Injectable } from '@nestjs/common';
import { IMessageService } from './interface/message.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/Entites/user.entity';
import { Repository } from 'typeorm';
import { Message, MessageType } from 'src/Entites/messages.entity';
import { SendMessageDTO } from './dto/send-message.dto';

@Injectable()
export class MessagesService implements IMessageService {
  constructor(
    @InjectRepository(User)
    protected readonly userRpository: Repository<User>,
    @InjectRepository(Message)
    protected readonly messageRepository: Repository<Message>,
  ) {}
  async sendMessage(
    payload: SendMessageDTO,
    senderId: string,
  ): Promise<Message | void> {
    // Implementation for sending a message
    const {
      content,
      conversationId,
      replyToMessageId,
      type = MessageType.TEXT,
      metadata,
    } = payload;
    const message = this.messageRepository.create({
      senderId,
      content,
      conversationId,
      replyToMessageId: replyToMessageId,
      messageType: type,
      attachments: metadata,
      readAt: new Date(),
    });
    await this.messageRepository.save(message);
    return message;
  }
}
