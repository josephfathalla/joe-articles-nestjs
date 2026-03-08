import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createCategoryDto: CreateCategoryDto, userId: string) {
    try {
      return await this.databaseService.category.create({
        data: {
          ...createCategoryDto,
          userId,
        },
        include: {
          articles: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to create category');
    }
  }

  async findAll() {
    return await this.databaseService.category.findMany({
      orderBy: { createdAt: 'desc' },
      include: { articles: true, _count: true },
    });
  }

  async findOne(id: string) {
    const category = await this.databaseService.category.findUnique({
      where: { id },
      include: { articles: { select: { id: true, title: true } } },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }

    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    userId: string,
  ) {
    try {
      const category = await this.findOne(id);

      if (category.userId && category.userId !== userId) {
        throw new UnauthorizedException(
          'You can only update your own categories',
        );
      }

      return await this.databaseService.category.update({
        where: { id },
        data: updateCategoryDto,
        include: {
          articles: true,
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to update category');
    }
  }

  async remove(id: string, userId: string) {
    try {
      // Get category with articles before deletion to return info
      const category = await this.findOne(id);

      if (category.userId && category.userId !== userId) {
        throw new UnauthorizedException(
          'You can only delete your own categories',
        );
      }
      // Delete the category (Prisma automatically removes from join table)
      await this.databaseService.category.delete({ where: { id } });

      // Return information about the deleted category and affected articles
      return {
        message: 'Category deleted successfully',
        category: {
          id: category.id,
          name: category.name,
        },
        affectedArticles: category.articles.map((article) => ({
          id: article.id,
          title: article.title,
        })),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete category');
    }
  }
}
