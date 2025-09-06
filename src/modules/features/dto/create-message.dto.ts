import { IsNotEmpty, IsString, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty({
    example: 'e4a1d3e8-998f-4f2b-a245-6d65a98ea4fb',
    description: 'Conversation ID to which this message belongs',
  })
  @IsNotEmpty({ message: 'Conversation ID is required' })
  @IsUUID('4', { message: 'Conversation ID must be a valid UUID' })
  conversation: string;

  @ApiProperty({
    example: 'Can you explain how transformers work in AI?',
    description: 'Message content sent by the user',
  })
  @IsNotEmpty({ message: 'Message content is required' })
  @IsString({ message: 'Content must be a string' })
  content: string;

  @ApiProperty({
    description: 'Optional array of knowledge IDs relevant to the message',
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsUUID('4', {
    each: true,
    message: 'Each knowledge ID must be a valid UUID',
  })
  knowledge?: string[];
}
