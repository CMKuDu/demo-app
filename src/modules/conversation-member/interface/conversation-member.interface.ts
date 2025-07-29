import { ConversationMember } from 'src/Entites/conversationMember.entity';
import { AddMemberDto } from '../req/conversation-member.add.dto';
import { RemoveMemberDto } from '../req/conversation-member.kick.dto';

export const IConversationMemberToken = 'IConversationMemberService';
export interface IConversationMemberService {
  addMember(dto: AddMemberDto): Promise<ConversationMember>;

  /**
   * Xóa một thành viên khỏi cuộc trò chuyện
   * @param conversationId ID của cuộc trò chuyện
   * @param userId ID của người dùng cần xóa
   */
  removeMember(dto: RemoveMemberDto): Promise<void>;
}
