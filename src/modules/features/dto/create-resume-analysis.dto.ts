import {
  IsString,
  IsOptional,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsValidUri } from 'src/common/validators/is-valid-uri.validator';

const transformToArray = ({
  value,
}: {
  value: string | string[];
}): string[] | undefined => {
  // If value is falsy (null, undefined, ''), return undefined.
  if (!value) return undefined;

  // Ensure value is an array of strings.
  const links = Array.isArray(value) ? value : String(value).split(',');

  // Trim whitespace from each link and filter out any empty strings.
  const trimmedAndFiltered = links.map(item => String(item).trim()).filter(Boolean);

  // If the array is empty after filtering, return undefined so @IsOptional() works.
  return trimmedAndFiltered.length > 0 ? trimmedAndFiltered : undefined;
};

export class CreateResumeAnalysisDto {
  @ApiProperty({
    example: 'A job description for a software engineer...',
    description: 'The job description text to analyze resumes against.',
  })
  @IsString()
  description: string;

  @ApiProperty({
    example: [
      'https://docs.google.com/document/d/your_doc_id/edit',
      'https://drive.google.com/file/d/your_file_id/view',
      'https://example.com/resume.txt',
      'file:///C:/Users/YourName/Documents/resume.pdf',
    ],
    description:
      'An array of public web URLs (Google Docs, Google Drive, PDF, TXT, etc.) or local file URIs.',
    required: false,
    type: [String],
  })
  @IsOptional()
  @Transform(transformToArray)
  @IsArray()
  @ArrayNotEmpty()
  @IsValidUri({ each: true })
  resumeLink?: string[];
}
