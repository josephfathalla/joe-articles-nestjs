import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { Prisma } from '../generated/prisma/client';
@Injectable()
export class ArticlesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createArticleDto: Prisma.ArticleCreateInput) {
    return this.databaseService.article.create({
      data: createArticleDto,
    });
  }

  async findAll() {
    return this.databaseService.article.findMany();
  }

  async findOne(id: string) {
    return this.databaseService.article.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateArticleDto: Prisma.ArticleUpdateInput) {
    return this.databaseService.article.update({
      where: { id },
      data: updateArticleDto,
    });
  }

  async remove(id: string) {
    return this.databaseService.article.delete({ where: { id } });
  }
}
