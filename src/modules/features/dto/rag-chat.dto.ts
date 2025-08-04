import { IsEnum, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from 'src/common/enums/role.enum';

export class CreateRagChatDto {
  @ApiProperty({ description: 'The actual message content' })
  @IsString({ message: 'Message must be a string' })
  content: string;

  @ApiProperty({ enum: UserRole, description: 'Sender role (user or ai)' })
  @IsEnum(UserRole, { message: 'Role must be either "user" or "ai"' })
  role: UserRole;

  @ApiProperty({ description: 'UUID of the sender' })
  @IsUUID('4', { message: 'Sender ID must be a valid UUID' })
  senderId: string;

  @ApiProperty({ description: 'UUID of the receiver' })
  @IsUUID('4', { message: 'Receiver ID must be a valid UUID' })
  receiverId: string;

  @ApiProperty({ description: 'UUID of the user this message belongs to' })
  @IsUUID('4', { message: 'User ID must be a valid UUID' })
  user:string;

  @ApiProperty({ description: 'UUID of the conversation this message belongs to' })
  @IsUUID('4', { message: 'Conversation ID must be a valid UUID' })
  conversationId: string;
}
