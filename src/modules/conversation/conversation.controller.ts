import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Param,
  Post,
} from '@nestjs/common';
import {
  IConversationService,
  IConversationToken,
} from './interface/conversation.interface';
import { ApiResponse } from 'src/classes/api-response.class';
import { CreateDirectConversationDto, CreateGroupConversationDto } from './req/coversation.create.dto';
import { GetUserConversationsDto } from './req/conversation.get.dto';

@Controller('conversation')
export class ConversationController {
  constructor(
    @Inject(IConversationToken)
    private readonly conversationService: IConversationService,
  ) {}

  @Post('create-direct-conversation')
  async CreateDirectConversation(
    @Body() dto: CreateDirectConversationDto,
  ) {
    const res = await this.conversationService.createDirectConversation(dto);
    return new ApiResponse(HttpStatus.OK, 'Successfully', res);
  }

  @Post('create-group-conversation')
  async CreateGroupConversation(
    @Body() dto: CreateGroupConversationDto,
  ) {
    const res = await this.conversationService.createGroupConversation(dto);
    return new ApiResponse(HttpStatus.OK, 'Successfully', res);
  }

  @Get('get-conversation/:userId')
  async GetConversation(@Param('userId') userId: string) {
    const dto: GetUserConversationsDto = { userId };
    const res = await this.conversationService.getUserConversations(dto);
    return new ApiResponse(HttpStatus.OK, 'Successfully', res);
  }
}
