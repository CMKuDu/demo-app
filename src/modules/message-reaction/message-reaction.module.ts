import { Module } from '@nestjs/common';
import { MessageReactionService } from './message-reaction.service';
import { MessageReactionController } from './message-reaction.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageReaction } from 'src/Entites/messageReaction.entity';
import { UnitOfWork } from '../helper/UnitOfWork';
import { IMessageReactionToken } from './interface/message-reaction.interface';

@Module({
  providers: [
    UnitOfWork,
    { provide: IMessageReactionToken, useClass: MessageReactionService },
  ],
  controllers: [MessageReactionController],
  imports: [
    TypeOrmModule.forFeature([MessageReaction]), // Assuming MessageReaction is the entity for message reactions
  ],
  exports: [IMessageReactionToken],
})
export class MessageReactionModule {}
