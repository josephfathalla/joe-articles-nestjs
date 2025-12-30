import { IsArray, IsUUID, ArrayMinSize } from 'class-validator';

export class BulkDeleteArticlesDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one article ID is required' })
  @IsUUID('4', { each: true, message: 'Invalid article ID format' })
  ids: string[];
}
