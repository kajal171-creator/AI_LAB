import { IsString, IsNotEmpty } from 'class-validator';

export class GenerateImageDto {
  @IsString()
  @IsNotEmpty({ message: 'Text prompt is required' })
  text: string;
} 