import {
  IsString,
  IsOptional,
  IsDateString,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMeetingDto {
  @ApiProperty({ example: 'Vinay Krishna Gupta', description: "Attendee's full name" })
  @IsString()
  attendee_name: string;

  @ApiProperty({ example: 'CEO', description: "Attendee's title" })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Antino Labs Private Limited', description: "Attendee's organization" })
  @IsString()
  organization: string;

  @ApiProperty({ required: false, example: '2024-12-20', description: 'Date of the meeting' })
  @IsOptional()
  @IsDateString()
  meeting_date?: string;

  @ApiProperty({ default: 'TechCorp', example: 'Your Company Name', description: 'Your company name' })
  @IsOptional()
  @IsString()
  our_company: string;

  @ApiProperty({ default: ['AI Solutions', 'Digital Transformation'], description: 'List of your solutions' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  our_solutions: string[];
}
