export class CreateDirectConversationDto {
  userA: string;
  userB: string;
}
export class CreateGroupConversationDto {
  creatorId: string;
  memberIds: string[];
  name: string;
  avatar?: string;
}
