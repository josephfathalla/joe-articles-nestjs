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
import { Article, Prisma } from 'src/generated/prisma/client';

@Injectable()
export class ArticlesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createArticleDto: CreateArticleDto) {
    try {
      const { categoryIds, categories, ...articleData } = createArticleDto;

      // Verify existing category IDs if provided
      if (categoryIds && categoryIds.length > 0) {
        const existingCategories = await this.databaseService.category.findMany(
          {
            where: {
              id: { in: categoryIds },
            },
          },
        );

        if (existingCategories.length !== categoryIds.length) {
          const foundIds = existingCategories.map((c) => c.id);
          const missingIds = categoryIds.filter((id) => !foundIds.includes(id));
          throw new NotFoundException(
            `Categories with IDs "${missingIds.join(', ')}" not found`,
          );
        }
      }

      // Build categories connection/creation data
      const categoriesData: {
        connect?: { id: string }[];
        create?: { name: string }[];
      } = {};

      if (categoryIds && categoryIds.length > 0) {
        categoriesData.connect = categoryIds.map((id) => ({ id }));
      }

      if (categories && categories.length > 0) {
        categoriesData.create = categories.map((cat) => ({ name: cat.name }));
      }

      return await this.databaseService.article.create({
        data: {
          ...articleData,
          categories:
            Object.keys(categoriesData).length > 0 ? categoriesData : undefined,
        },
        include: {
          categories: { orderBy: { createdAt: 'desc' } },
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to create article');
    }
  }

  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResult<Article>> {
    const params = PaginationUtil.getPaginationParams(paginationQuery);

    // Build orderBy dynamically
    const orderBy: Prisma.ArticleOrderByWithRelationInput = params.sortBy
      ? { [params.sortBy]: params.sortOrder }
      : { createdAt: 'desc' }; // Default sorting

    // Build where clause for filtering
    const where: Prisma.ArticleWhereInput = {};
    if (paginationQuery.categoryId) {
      where.categories = {
        some: {
          id: paginationQuery.categoryId,
        },
      };
    }

    // Get total count and paginated data in parallel
    const [total, data] = await Promise.all([
      this.databaseService.article.count({ where }),
      this.databaseService.article.findMany({
        where,
        skip: params.skip,
        take: params.limit,
        orderBy,
        include: {
          categories: { orderBy: { createdAt: 'desc' } },
        },
      }),
    ]);

    return PaginationUtil.createPaginatedResult(data, total, params);
  }

  async findOne(id: string) {
    const article = await this.databaseService.article.findUnique({
      where: { id },
      include: {
        comments: { orderBy: { createdAt: 'desc' } },
        categories: { orderBy: { createdAt: 'desc' } },
      },
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

      const { categoryIds, categories, ...articleData } = updateArticleDto;

      // Build categories update data
      type CategorySetItem =
        | { id: string }
        | {
            connectOrCreate: {
              where: { name: string };
              create: { name: string };
            };
          };

      type CategoriesUpdateData = {
        set: CategorySetItem[];
      };

      let categoriesData: CategoriesUpdateData | undefined = undefined;

      // Handle category updates only if categoryIds or categories are provided
      if (categoryIds !== undefined || categories !== undefined) {
        categoriesData = {
          set: [],
        };

        // If categoryIds is an empty array, it means remove all categories
        if (categoryIds !== undefined && categoryIds.length === 0) {
          categoriesData.set = [];
        }
        // If categoryIds is provided (non-empty), verify and connect them
        else if (categoryIds && categoryIds.length > 0) {
          // Verify existing category IDs
          const existingCategories =
            await this.databaseService.category.findMany({
              where: {
                id: { in: categoryIds },
              },
            });

          if (existingCategories.length !== categoryIds.length) {
            const foundIds = existingCategories.map((c) => c.id);
            const missingIds = categoryIds.filter(
              (id) => !foundIds.includes(id),
            );
            throw new NotFoundException(
              `Categories with IDs "${missingIds.join(', ')}" not found`,
            );
          }

          // If categories (new ones) are also provided, we need to handle both
          if (categories && categories.length > 0) {
            // Use connectOrCreate for new categories (handles duplicates by name)
            const connectOrCreateCategories: CategorySetItem[] = categories.map(
              (cat) => ({
                connectOrCreate: {
                  where: { name: cat.name },
                  create: { name: cat.name },
                },
              }),
            );

            // Combine existing IDs with connectOrCreate operations
            categoriesData.set = [
              ...categoryIds.map((id) => ({ id })),
              ...connectOrCreateCategories,
            ];
          } else {
            // Only existing categoryIds provided
            categoriesData.set = categoryIds.map((id) => ({ id }));
          }
        }
        // If only categories (new ones) are provided without categoryIds
        else if (categories && categories.length > 0) {
          // Use connectOrCreate to handle both existing and new categories by name
          categoriesData.set = categories.map((cat) => ({
            connectOrCreate: {
              where: { name: cat.name },
              create: { name: cat.name },
            },
          }));
        }
      }

      // Prepare update data
      const updateData: {
        title?: string;
        description?: string;
        type?: string;
        categories?: CategoriesUpdateData;
      } = {
        ...articleData,
      };

      // Only include categories if we have category data to update
      if (categoriesData !== undefined) {
        updateData.categories = categoriesData;
      }

      // Perform the update
      return await this.databaseService.article.update({
        where: { id },
        data: updateData as Prisma.ArticleUpdateInput,
        include: {
          categories: { orderBy: { createdAt: 'desc' } },
          comments: { orderBy: { createdAt: 'desc' } },
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to update article',
      );
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    return await this.databaseService.article.delete({ where: { id } });
  }

  async removeBulk(ids: string[]) {
    // to verify the ids are valid
    const articles = await this.databaseService.article.findMany({
      where: { id: { in: ids } },
    });
    if (articles.length !== ids.length) {
      const foundIds = articles.map((a) => a.id);
      const missingIds = ids.filter((id) => !foundIds.includes(id));
      throw new NotFoundException(
        `Articles with IDs "${missingIds.join(', ')}" not found`,
      );
    }
    return await this.databaseService.article.deleteMany({
      where: { id: { in: ids } },
    });
  }

  async bulkArticlesCategoryAssign(
    categoryId: string,
    articleIds: string[],
  ): Promise<{ count: number; message: string }> {
    try {
      // Verify category exists
      const category = await this.databaseService.category.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        throw new NotFoundException(
          `Category with ID "${categoryId}" not found`,
        );
      }

      // Verify articles exist
      const existingArticles = await this.databaseService.article.findMany({
        where: {
          id: { in: articleIds },
        },
      });

      if (existingArticles.length !== articleIds.length) {
        const foundIds = existingArticles.map((a) => a.id);
        const missingIds = articleIds.filter((id) => !foundIds.includes(id));
        throw new NotFoundException(
          `Articles with IDs "${missingIds.join(', ')}" not found`,
        );
      }

      // Use transaction to update all articles
      const result = await this.databaseService.$transaction(
        articleIds.map((articleId) =>
          this.databaseService.article.update({
            where: { id: articleId },
            data: {
              categories: {
                connect: { id: categoryId },
              },
            },
          }),
        ),
      );

      return {
        count: result.length,
        message: `Successfully assigned category to ${result.length} article(s)`,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to assign category to articles');
    }
  }
}
