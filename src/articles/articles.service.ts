import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { Prisma } from '../generated/prisma/client';
import { PaginationUtil } from 'src/common/utils/pagination.util';
import { PaginatedResult } from 'src/common/interfaces/pagination.interface';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
@Injectable()
export class ArticlesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createArticleDto: Prisma.ArticleCreateInput) {
    try {
      return await this.databaseService.article.create({
        data: createArticleDto,
      });
    } catch (error) {
      this.handlePrismaError(error, 'creating article');
    }
  }

  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResult<any>> {
    const params = PaginationUtil.getPaginationParams(paginationQuery);

    // Build orderBy dynamically
    const orderBy: any = params.sortBy
      ? { [params.sortBy]: params.sortOrder }
      : { createdAt: 'desc' }; // Default sorting

    // Get total count and paginated data in parallel
    const [total, data] = await Promise.all([
      this.databaseService.article.count(),
      this.databaseService.article.findMany({
        skip: params.skip,
        take: params.limit,
        orderBy,
      }),
    ]);

    return PaginationUtil.createPaginatedResult(data, total, params);
  }
  async findOne(id: string) {
    const article = await this.databaseService.article.findUnique({
      where: { id },
    });

    if (!article) {
      throw new NotFoundException(`Article with ID "${id}" not found`);
    }

    return article;
  }

  async update(id: string, updateArticleDto: Prisma.ArticleUpdateInput) {
    try {
      // Check if article exists first
      await this.findOne(id);

      return await this.databaseService.article.update({
        where: { id },
        data: updateArticleDto,
      });
    } catch (error) {
      // If it's a NotFoundException from findOne, re-throw it
      if (error instanceof NotFoundException) {
        throw error;
      }
      // Otherwise handle Prisma errors
      this.handlePrismaError(error, 'updating article');
    }
  }

  async remove(id: string) {
    try {
      // Check if article exists first
      await this.findOne(id);

      return await this.databaseService.article.delete({ where: { id } });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handlePrismaError(error, 'deleting article');
    }
  }
  private handlePrismaError(error: any, operation: string): never {
    console.error(`Error ${operation}:`, error);

    // Handle Prisma known errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          // Unique constraint failed
          throw new BadRequestException(
            `An article with this ${error.meta?.target} already exists`,
          );
        case 'P2025':
          // Record not found
          throw new NotFoundException('Article not found');
        case 'P2003':
          // Foreign key constraint failed
          throw new BadRequestException('Invalid reference');
        default:
          throw new InternalServerErrorException(
            `Database error while ${operation}`,
          );
      }
    }

    // Handle Prisma validation errors
    if (error instanceof Prisma.PrismaClientValidationError) {
      throw new BadRequestException('Invalid data provided');
    }

    // Generic error fallback
    throw new InternalServerErrorException(
      `An error occurred while ${operation}`,
    );
  }
}
