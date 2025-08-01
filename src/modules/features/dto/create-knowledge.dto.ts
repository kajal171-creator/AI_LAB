import { IsNotEmpty, IsString, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateKnowledgeDto {
  @ApiProperty({
    description: 'Publicly accessible URL to the knowledge resource',
  })
  @IsUrl({}, { message: 'URL must be a valid URL' })
  @IsNotEmpty({ message: 'URL is required' })
  url: string;

  @ApiProperty({
    example: ['c79eab93-37fa-4c61-84d1-4a85a553a37f'],
    description: 'Array of conversation IDs to associate with this knowledge',
    required: false,
    type: [String],
  })
  @IsString({ each: true, message: 'Each conversation ID must be a valid string UUID' })
  @IsNotEmpty({ each: true, message: 'Conversation ID cannot be empty' })
  conversations?: string[];
}
