import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { PaginationUtil } from 'src/common/utils/pagination.util';
import { PaginatedResult } from 'src/common/interfaces/pagination.interface';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
@Injectable()
export class ArticlesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createArticleDto: CreateArticleDto) {
    try {
      return await this.databaseService.article.create({
        data: createArticleDto,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Article with this title already exists');
      }
      throw new BadRequestException('Failed to create article');
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
      include: { comments: { orderBy: { createdAt: 'desc' } } },
    });

    if (!article) {
      throw new NotFoundException(`Article with ID "${id}" not found`);
    }

    return article;
  }

  async update(id: string, updateArticleDto: UpdateArticleDto) {
    try {
      // Check if article exists first
      await this.findOne(id);

      return await this.databaseService.article.update({
        where: { id },
        data: updateArticleDto,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error.code === 'P2002') {
        throw new BadRequestException('Article with this title already exists');
      }
      throw new BadRequestException('Failed to update article');
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    return await this.databaseService.article.delete({ where: { id } });
  }
}
