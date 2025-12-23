import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    try {
      return await this.databaseService.category.create({
        data: createCategoryDto,
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
      include: { articles: { select: { id: true, title: true } } },
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

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    try {
      await this.findOne(id);

      return await this.databaseService.category.update({
        where: { id },
        data: updateCategoryDto,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to update category');
    }
  }

  async remove(id: string) {
    try {
      // Get category with articles before deletion to return info
      const category = await this.findOne(id);

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
