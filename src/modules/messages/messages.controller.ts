import { Body, Controller, HttpStatus, Inject, Post } from '@nestjs/common';
import {
  IMessageService,
  IMessageServiceToken,
} from './interface/message.interface';
import { SendMessageDTO } from './dto/send-message.dto';
import { ApiResponse } from 'src/classes/api-response.class';

@Controller('messages')
export class MessagesController {
  constructor(
    @Inject(IMessageServiceToken)
    private readonly messageService: IMessageService,
  ) {}
  @Post('send-message')
  async SendMessage(@Body() payload: SendMessageDTO, senderId: string) {
    const res = await this.messageService.sendMessage(payload, senderId);
    return new ApiResponse(HttpStatus.OK, 'Gửi tin nhắn', res);
  }
}
