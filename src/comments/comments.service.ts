import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createCommentDto: CreateCommentDto) {
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

      return await this.databaseService.comment.create({
        data: createCommentDto,
        include: { article: { select: { id: true, title: true } } },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to create comment');
    }
  }

  async findAllByArticle(articleId: string) {
    return await this.databaseService.comment.findMany({
      where: { articleId },
      orderBy: { createdAt: 'desc' },
      include: {
        article: {
          select: { id: true, title: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const comment = await this.databaseService.comment.findUnique({
      where: { id },
      include: {
        article: {
          select: { id: true, title: true },
        },
      },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID "${id}" not found`);
    }

    return comment;
  }

  async update(id: string, updateCommentDto: UpdateCommentDto) {
    try {
      await this.findOne(id);

      return await this.databaseService.comment.update({
        where: { id },
        data: updateCommentDto,
        include: {
          article: {
            select: { id: true, title: true },
          },
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to update comment');
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    return await this.databaseService.comment.delete({ where: { id } });
  }
}
