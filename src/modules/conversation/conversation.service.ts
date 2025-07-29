import { Injectable } from '@nestjs/common';
import { IConversationService } from './interface/conversation.interface';
import {
  Conversation,
  ConversationType,
} from 'src/Entites/conversation.entity';
import {
  ConversationMember,
  MemberRole,
} from 'src/Entites/conversationMember.entity';
import { UnitOfWork } from '../helper/UnitOfWork';
import {
  CreateDirectConversationDto,
  CreateGroupConversationDto,
} from './req/coversation.create.dto';
import { GetUserConversationsDto } from './req/conversation.get.dto';
import { CheckConversationDto } from './req/conversation.check.dto';

@Injectable()
export class ConversationService implements IConversationService {
  constructor(private readonly unitOfWork: UnitOfWork) {}

  async createDirectConversation(
    dto: CreateDirectConversationDto,
  ): Promise<Conversation> {
    const { userA, userB } = dto;
    return this.unitOfWork.execute(async (manager) => {
      if (userA === userB) {
        throw new Error('Cannot create a conversation with yourself');
      }
      const [user1, user2] = [userA, userB].sort();
      const existingConversation = await manager
        .createQueryBuilder(Conversation, 'c')
        .innerJoin('c.members', 'm')
        .where('c.type = :type', { type: ConversationType.DIRECT })
        .andWhere('m.userId IN (:...users)', { users: [user1, user2].sort() })
        .groupBy('c.id')
        .having('COUNT(DISTINCT m.userId) = 2')
        .getOne();
      if (existingConversation) {
        await manager.update(Conversation, existingConversation.id, {
          updatedAt: new Date(),
        });
        return existingConversation;
      }
      const conversation = manager.create(Conversation, {
        type: ConversationType.DIRECT,
      });
      await manager.save(conversation);
      const members = [
        manager.create(ConversationMember, {
          userId: userA,
          conversationId: conversation.id.toString(),
          role: MemberRole.MEMBER,
        }),
        manager.create(ConversationMember, {
          userId: userB,
          conversationId: conversation.id.toString(),
          role: MemberRole.MEMBER,
        }),
      ];
      await manager.save(ConversationMember, members);
      return conversation;
    });
  }

  async createGroupConversation(
    dto: CreateGroupConversationDto,
  ): Promise<Conversation | null> {
    const { creatorId, memberIds, name, avatar } = dto;
    return await this.unitOfWork.execute(async (manager) => {
      if (memberIds.length < 1) {
        throw new Error('A group must have at least 1 other member');
      }
      if (!memberIds.includes(creatorId)) {
        memberIds.push(creatorId);
      }
      const conversation = manager.create(Conversation, {
        creatorId,
        name,
        avatar,
        type: ConversationType.GROUP,
      });
      await manager.save(Conversation, conversation);
      const members = memberIds.map((userId) =>
        manager.create(ConversationMember, {
          userId,
          conversationId: conversation.id.toString(),
          role: userId === creatorId ? MemberRole.OWNER : MemberRole.MEMBER,
        }),
      );
      await manager.save(ConversationMember, members);
      conversation.members = members;
      return conversation;
    });
  }

  async getUserConversations(
    dto: GetUserConversationsDto,
  ): Promise<Conversation[]> {
    const { userId } = dto;
    return await this.unitOfWork.execute(async (manager) => {
      const conversation = await manager.find(Conversation, {
        relations: ['members', 'messages'],
        where: {
          members: {
            userId: userId,
          },
        },
        order: {
          updatedAt: 'DESC',
        },
      });
      return conversation;
    });
  }

  async checkConversation(
    dto: CheckConversationDto,
  ): Promise<Conversation | null> {
    const { conversationId } = dto;
    return await this.unitOfWork.execute(async (manager) => {
      const conversation = manager.findOne(Conversation, {
        where: { id: Number(conversationId) },
      });
      if (!conversation) {
        throw new Error('Conversation not found');
      }
      return conversation;
    });
  }
}
