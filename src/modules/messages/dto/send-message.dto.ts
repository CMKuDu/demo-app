import { IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { MessageType } from 'src/Entites/messages.entity';

export class SendMessageDTO {
  @IsString()
  @MaxLength(1000) // giới hạn độ dài nội dung
  content: string;

  @IsEnum(MessageType)
  @IsOptional()
  type?: MessageType = MessageType.TEXT;

  @IsUUID()
  conversationId: string;

  @IsUUID()
  @IsOptional()
  replyToMessageId?: string; // ✅ đổi từ number sang string

  @IsOptional()
  metadata?: Record<string, any>; // tốt hơn là any
}
