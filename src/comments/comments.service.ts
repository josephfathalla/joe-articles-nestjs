import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createCommentDto: CreateCommentDto, userId?: string) {
    try {
      // Verify article exists
      const article = await this.databaseService.article.findUnique({
        where: { id: createCommentDto.articleId },
      });

      if (!article) {
        throw new NotFoundException(
          `Article with ID "${createCommentDto.articleId}" not found`,
        );
      }

      const comment = await this.databaseService.comment.create({
        data: {
          ...createCommentDto,
          userId: userId || undefined,
        },
        include: {
          article: { select: { id: true, title: true } },
          user: { select: { id: true, name: true } },
        },
      });

      return {
        ...comment,
        user: comment.userId ? comment.user : { id: null, name: 'Guest' },
      };
    } catch (error) {
      console.error('Error creating comment', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to create comment');
    }
  }

  async findOne(id: string) {
    const comment = await this.databaseService.comment.findUnique({
      where: { id },
      include: {
        article: {
          select: { id: true, title: true },
        },
        user: {
          select: { id: true, name: true },
        },
      },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID "${id}" not found`);
    }

    return {
      ...comment,
      user: comment.user ? comment.user : { id: null, name: 'Guest' },
    };
  }

  async update(id: string, updateCommentDto: UpdateCommentDto, userId: string) {
    try {
      // First, find the comment and check ownership
      const comment = await this.databaseService.comment.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (!comment) {
        throw new NotFoundException(`Comment with ID "${id}" not found`);
      }

      if (comment.userId && comment.userId !== userId) {
        throw new UnauthorizedException(
          'You can only update your own comments',
        );
      }

      // Update the comment
      const updatedComment = await this.databaseService.comment.update({
        where: { id },
        data: updateCommentDto,
        include: {
          article: {
            select: { id: true, title: true },
          },
          user: {
            select: { id: true, name: true },
          },
        },
      });

      return {
        ...updatedComment,
        user: updatedComment.userId
          ? updatedComment.user
          : { id: null, name: 'Guest' },
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to update comment');
    }
  }

  async remove(id: string, userId: string) {
    try {
      // First, find the comment and check ownership
      const comment = await this.databaseService.comment.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (!comment) {
        throw new NotFoundException(`Comment with ID "${id}" not found`);
      }

      // Check if the comment belongs to the user
      // if (!comment.userId) {
      //   throw new UnauthorizedException('Guest comments cannot be deleted');
      // }

      if (comment.userId && comment.userId !== userId) {
        throw new UnauthorizedException(
          'You can only delete your own comments',
        );
      }

      return await this.databaseService.comment.delete({ where: { id } });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to delete comment');
    }
  }
}
