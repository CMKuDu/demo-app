import { Inject, Injectable } from '@nestjs/common';
import { UnitOfWork } from '../helper/UnitOfWork';
import { IConversationMemberService } from './interface/conversation-member.interface';
import {
  ConversationMember,
  MemberRole,
} from 'src/Entites/conversationMember.entity';
import {
  IConversationService,
  IConversationToken,
} from '../conversation/interface/conversation.interface';
import { RemoveMemberDto } from './req/conversation-member.kick.dto';
import { AddMemberDto } from './req/conversation-member.add.dto';

@Injectable()
export class ConversationMemberService implements IConversationMemberService {
  constructor(
    private readonly unitOfWork: UnitOfWork,
    @Inject(IConversationToken)
    private readonly conversationService: IConversationService,
  ) {}

  async addMember(dto: AddMemberDto): Promise<ConversationMember> {
    const { conversationId, userId } = dto;

    return await this.unitOfWork.execute(async (manager) => {
      const existingConversation =
        await this.conversationService.checkConversation({ conversationId });

      if (!existingConversation) {
        throw new Error('Conversation does not exist');
      }

      const existingMember = await manager.findOne(ConversationMember, {
        where: { conversationId, userId },
      });

      if (existingMember) {
        return existingMember; // Không thêm trùng
      }

      const member = manager.create(ConversationMember, {
        userId,
        conversationId,
        role: MemberRole.MEMBER,
        joinedAt: new Date(),
      });
      await manager.save(member);

      existingConversation.update_at = new Date();
      await manager.save(existingConversation);

      return member;
    });
  }

  async removeMember(dto: RemoveMemberDto): Promise<void> {
    const { conversationId, userId, requesterId } = dto;

    await this.unitOfWork.execute(async (manager) => {
      await this.conversationService.checkConversation({ conversationId });

      const requester = await manager.findOne(ConversationMember, {
        where: { conversationId, userId: requesterId },
      });
      if (!requester) throw new Error('You are not in this conversation');
      if (requester.role !== MemberRole.ADMIN) {
        throw new Error('Only ADMIN can remove members');
      }

      const member = await manager.findOne(ConversationMember, {
        where: { conversationId, userId },
      });
      if (!member) throw new Error('Member not found');
      if (member.role === MemberRole.ADMIN) {
        throw new Error('Cannot remove another admin');
      }

      await manager.delete(ConversationMember, { conversationId, userId });
    });
  }
}
