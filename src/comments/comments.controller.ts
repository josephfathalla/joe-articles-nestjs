import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UnauthorizedException,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import {
  AllowAnonymous,
  OptionalAuth,
  Session,
  type UserSession,
} from '@thallesp/nestjs-better-auth';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @OptionalAuth()
  create(
    @Body() createCommentDto: CreateCommentDto,
    @Session() session: UserSession | null,
  ) {
    return this.commentsService.create(
      createCommentDto,
      session?.user?.id || undefined,
    );
  }

  @AllowAnonymous()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commentsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Session() session: UserSession,
  ) {
    if (!session?.user?.id) {
      throw new UnauthorizedException(
        'You must be authenticated to update a comment',
      );
    }
    return this.commentsService.update(id, updateCommentDto, session.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Session() session: UserSession) {
    if (!session?.user?.id) {
      throw new UnauthorizedException(
        'You must be authenticated to delete a comment',
      );
    }
    return this.commentsService.remove(id, session.user.id);
  }
}
