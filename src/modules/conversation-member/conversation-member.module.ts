import { Module } from '@nestjs/common';
import { ConversationMemberService } from './conversation-member.service';
import { ConversationMemberController } from './conversation-member.controller';
import { UnitOfWork } from '../helper/UnitOfWork';
import { IConversationMemberToken } from './interface/conversation-member.interface';

@Module({
  providers: [
    UnitOfWork,
    {
      provide: IConversationMemberToken,
      useClass: ConversationMemberService,
    },
  ],
  controllers: [ConversationMemberController],
  exports: [IConversationMemberToken],
})
export class ConversationMemberModule {}
