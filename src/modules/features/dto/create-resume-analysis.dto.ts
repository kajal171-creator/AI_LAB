import {
  IsString,
  IsArray,
  ArrayNotEmpty,
  IsUrl,
  Matches,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

const GOOGLE_DOCS_URL_REGEX =
  /^https:\/\/docs\.google\.com\/document\/d\/[a-zA-Z0-9_-]+(\/.*)?$/;

const transformToArray = ({ value }: { value: any }): string[] | undefined => {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === 'string') {
    return value.split(',').map(item => item.trim());
  }
  return value;
};

export class CreateResumeAnalysisDto {
  @ApiProperty({
    example: 'A job description for a software engineer...',
    description: 'The job description text to analyze resumes against.',
  })
  @IsString()
  description: string;

  @ApiProperty({
    example: ['https://docs.google.com/document/d/your_document_id_1/edit'],
    description:
      'An array or comma-separated string of Google Docs resume links. Provide either this or a file.',
    required: false,
    type: [String],
  })
  @IsOptional()
  @Transform(transformToArray)
  @IsArray()
  @ArrayNotEmpty()
  @IsUrl({}, { each: true, message: 'Each resume link must be a valid URL.' })
  @Matches(GOOGLE_DOCS_URL_REGEX, {
    each: true,
    message: 'Each resume link must be a valid Google Docs URL.',
  })
  resumeLink: string[];
}