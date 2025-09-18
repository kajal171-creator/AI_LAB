
import { IsString, IsArray, IsNotEmpty, IsObject, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class EvaluationDto {
    @IsNumber()
    faithfulness: number;

    @IsNumber()
    answer_relevancy: number;

    @IsNumber()
    context_precision: number;

    @IsNumber()
    context_recall: number;
}

export class RagEvaluationRequestDto {
  @ApiProperty({ example: 'What is RAG?' })
  @IsString()
  @IsNotEmpty()
  query: string;

  @ApiProperty({ example: 'RAG is Retrieval Augmented Generation' })
  @IsString()
  @IsNotEmpty()
  answer: string;

  @ApiProperty({ example: ['Context 1', 'Context 2'], type: [String] })
  @IsArray()
  @IsString({ each: true })
  retrieved_contexts: string[];

  @ApiProperty({ example: 'Correct reference answer' })
  @IsString()
  @IsNotEmpty()
  reference: string;
}


export class RagEvaluationResponseDto {
    @IsObject()
    @ValidateNested()
    @Type(() => EvaluationDto)
    evaluation: EvaluationDto;
}
