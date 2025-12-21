import {
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCommentDto {
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty({ message: 'Text is required' })
  @MinLength(1, { message: 'Comment must be at least 1 character' })
  @MaxLength(500, { message: 'Comment cannot exceed 500 characters' })
  text: string;

  @IsUUID('4', { message: 'Invalid article ID format' })
  @IsNotEmpty({ message: 'Article ID is required' })
  articleId: string;
}
