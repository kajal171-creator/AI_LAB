import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, MessageStatus } from 'src/common/enums/role.enum';

export class CreateRagChatbotSwagger {
  @ApiProperty({
    description: 'Message content sent by user or AI',
    example: 'What is the capital of India?',
  })
  message: string;

  @ApiProperty({
    description: 'Who is sending the message',
    enum: UserRole,
    example: UserRole.USER,
  })
  senderType: UserRole;

  @ApiPropertyOptional({
    description:
      'Sender ID (UUID) — required only if senderType is "user". Should be omitted if senderType is "ai".',
    example: 'b3e1c7e0-9c15-4a7a-bf70-efda25ebf515',
  })
  senderId?: string;

}
