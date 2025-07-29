import { Conversation } from 'src/Entites/conversation.entity';
import { ConversationMember } from 'src/Entites/conversationMember.entity';
import { CreateDirectConversationDto, CreateGroupConversationDto } from '../req/coversation.create.dto';
import { GetUserConversationsDto } from '../req/conversation.get.dto';
import { CheckConversationDto } from '../req/conversation.check.dto';

export const IConversationToken = 'IConversationService'; // Injection Token
export interface IConversationService {
  /**
   * Tạo cuộc trò chuyện trực tiếp giữa 2 người dùng
   * @param userAId ID của người dùng A
   * @param userBId ID của người dùng B
   */
  createDirectConversation(
    dto: CreateDirectConversationDto
  ): Promise<Conversation>;

  /**
   * Tạo cuộc trò chuyện nhóm
   * @param creatorId ID của người tạo nhóm
   * @param memberIds Danh sách ID thành viên
   * @param name Tên nhóm
   * @param avatar Ảnh đại diện nhóm (tùy chọn)
   */
  createGroupConversation(
    dto: CreateGroupConversationDto
  ): Promise<Conversation | null>;

  /**
   * Thêm một thành viên vào cuộc trò chuyện
   * @param conversationId ID của cuộc trò chuyện
   * @param userId ID của người dùng cần thêm
   */
  

  /**
   * Lấy danh sách cuộc trò chuyện của một người dùng
   * @param userId ID của người dùng
   */
  getUserConversations(dto: GetUserConversationsDto): Promise<Conversation[]>;
  checkConversation(dto: CheckConversationDto): Promise<Conversation | null>;
}
