import { IsArray, IsUUID, ArrayMinSize } from 'class-validator';

export class BulkAssignCategoryDto {
  @IsUUID('4', { message: 'Invalid category ID format' })
  categoryId: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'At least one article ID is required' })
  @IsUUID('4', { each: true, message: 'Invalid article ID format' })
  articleIds: string[];
}
