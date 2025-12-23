import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsArray,
  MaxLength,
  MinLength,
  ValidateNested,
  IsUUID,
  IsOptional,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ArticleType } from '../../generated/prisma/client';

class CreateCategoryDto {
  @Transform(({ value }: { value: string }) => value?.trim())
  @IsString()
  @IsNotEmpty({ message: 'Category name is required' })
  @MinLength(1, { message: 'Category name must be at least 1 character' })
  @MaxLength(50, { message: 'Category name cannot exceed 50 characters' })
  name: string;
}

export class CreateArticleDto {
  @Transform(({ value }: { value: string }) => value?.trim())
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  @MinLength(5, { message: 'Title must be at least 5 characters' })
  @MaxLength(200, { message: 'Title cannot exceed 200 characters' })
  title: string;

  @Transform(({ value }: { value: string }) => value?.trim())
  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  @MinLength(10, { message: 'Description must be at least 10 characters' })
  @MaxLength(1000, { message: 'Description cannot exceed 1000 characters' })
  description: string;

  @IsEnum(ArticleType, { message: 'Type must be either "long" or "short"' })
  @IsNotEmpty({ message: 'Type is required' })
  type: ArticleType;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true, message: 'Invalid category ID format' })
  categoryIds?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCategoryDto)
  categories?: CreateCategoryDto[];
}
