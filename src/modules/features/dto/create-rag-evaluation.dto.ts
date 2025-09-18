import { IsString, IsArray, IsNotEmpty } from 'class-validator';

export class CreateRagEvaluationDto {
    @IsString()
    @IsNotEmpty()
    query: string;

    @IsString()
    @IsNotEmpty()
    answer: string;

    @IsArray()
    @IsString({ each: true })
    retrieved_contexts: string[];

    @IsString()
    @IsNotEmpty()
    reference: string;
}
