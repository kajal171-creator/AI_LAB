// src/run/dto/create-run.dto.ts
import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRunDto {
  @IsArray()
  @IsString({ each: true })
  tickers: string[];

  @IsString()
  risk_profile: string;

  @IsBoolean()
  auto: boolean;

  @IsString()
  @IsOptional()
  auto_mode?: string;

  @IsString()
@IsOptional()
  universe: string;

  @IsInt()
  count: number;

  @IsInt()
  @IsOptional()
  no_repeat_days?: number;
}
