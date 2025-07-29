import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MAX_LENGTH,
  MaxLength,
} from 'class-validator';
import { MessageStatus, MessageType } from 'src/Entites/messages.entity';

export class SendMessageDTO {
  @IsString()
  content: string;

  @IsEnum(MessageType)
  @IsOptional()
  type?: MessageType = MessageType.TEXT;

  @IsUUID()
  conversationId: string;

  @IsUUID()
  @IsOptional()
  replyToMessageId?: number;

  @IsOptional()
  metadata?: any;

  @IsEnum(MessageStatus)
  status: MessageStatus;
}
