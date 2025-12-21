import { PartialType } from '@nestjs/mapped-types';
import { CreateCommentDto } from './create-comment.dto';
import { OmitType } from '@nestjs/mapped-types';

// Can only update text, not articleId
export class UpdateCommentDto extends PartialType(
  OmitType(CreateCommentDto, ['articleId']),
) {}
