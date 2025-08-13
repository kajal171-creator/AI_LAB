import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTranslationDto {
  @ApiProperty({
    example: 'en',
    description: 'Source language code of the original text',
  })
  @IsNotEmpty({ message: 'Source language is required' })
  @IsString({ message: 'Source language must be a string' })
  sourceLanguage: string;

  @ApiProperty({
    example: 'fr',
    description: 'Target language code to translate the text into',
  })
  @IsNotEmpty({ message: 'Target language is required' })
  @IsString({ message: 'Target language must be a string' })
  targetLanguage: string;

  @ApiProperty({
    example: 'Hello, how are you?',
    description: 'The original text that needs to be translated',
  })
  @IsNotEmpty({ message: 'Original text is required' })
  @IsString({ message: 'Original text must be a string' })
  text: string;

  @ApiProperty({
    example: 'formal',
    description: 'Style or tone for the translated text',
  })
  @IsNotEmpty({ message: 'Style is required' })
  @IsString({ message: 'Style must be a string' })
  style: string;
}
