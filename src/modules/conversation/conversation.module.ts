import { Module } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ConversationController } from './conversation.controller';
import { UnitOfWork } from '../helper/UnitOfWork';
import { IConversationToken } from './interface/conversation.interface';

@Module({
  providers: [
    UnitOfWork,
    {
      provide: IConversationToken,
      useClass: ConversationService,
    },
  ],
  controllers: [ConversationController],
  exports: [IConversationToken],
})
export class ConversationModule {}
