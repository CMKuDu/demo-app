import {
  Body,
  Controller,
  Delete,
  HttpStatus,
  Inject,
  Post,
} from '@nestjs/common';
import {
  IConversationMemberService,
  IConversationMemberToken,
} from './interface/conversation-member.interface';
import { ApiResponse } from 'src/classes/api-response.class';
import { AddMemberDto } from './req/conversation-member.add.dto';
import { RemoveMemberDto } from './req/conversation-member.kick.dto';

@Controller('conversation-member')
export class ConversationMemberController {
  constructor(
    @Inject(IConversationMemberToken)
    private readonly coversationMemberservice: IConversationMemberService,
  ) {}

  @Post('invite-member')
  async InviteMember(@Body() dto: AddMemberDto) {
    const res = await this.coversationMemberservice.addMember(dto);
    return new ApiResponse(HttpStatus.OK, 'Member invited successfully', res);
  }

  @Delete('kick-member')
  async KickMember(@Body() dto: RemoveMemberDto) {
    await this.coversationMemberservice.removeMember(dto);
    return new ApiResponse(HttpStatus.OK, 'Member removed successfully');
  }
}
