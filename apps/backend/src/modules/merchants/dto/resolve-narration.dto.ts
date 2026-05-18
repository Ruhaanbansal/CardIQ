import { IsString, IsOptional } from 'class-validator';

export class ResolveNarrationDto {
  @IsString()
  narration: string;

  @IsString()
  @IsOptional()
  mccHint?: string;
}
