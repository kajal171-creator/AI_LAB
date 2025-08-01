import { IsOptional, IsString, IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateConversationDto {
  @ApiProperty({
    example: 'AI Chat Summary',
    description: 'Optional title for the conversation',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  title?: string;

  @ApiProperty({
    description: 'UUID of the user creating the conversation',
  })
  @IsUUID('4', { message: 'User ID must be a valid UUID' })
  @IsNotEmpty({ message: 'User ID is required' })
  user: string;

  @ApiProperty({
    example: 'Conversation about using AI for education',
    description: 'Main conversation message or content',
  })
  @IsNotEmpty({ message: 'Conversation is required' })
  conversation: string;

  @ApiProperty({
    description: 'Optional array of knowledge IDs associated with the conversation',
    required: false,
    type: [String],
  })
  @IsUUID('4', { each: true, message: 'Each knowledge ID must be a valid UUID' })
  knowledge?: string[];
}
