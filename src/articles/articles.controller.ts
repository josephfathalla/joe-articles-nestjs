import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Put,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { BulkAssignCategoryDto } from './dto/bulk-assign-category.dto';
import { BulkDeleteArticlesDto } from './dto/bulk-delete-articles.dto';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  create(@Body() createArticleDto: CreateArticleDto) {
    return this.articlesService.create(createArticleDto);
  }

  @Get()
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.articlesService.findAll(paginationQuery);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.articlesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateArticleDto: UpdateArticleDto) {
    return this.articlesService.update(id, updateArticleDto);
  }

  @Delete('bulk')
  bulkRemove(@Body() bulkDeleteArticlesDto: BulkDeleteArticlesDto) {
    return this.articlesService.removeBulk(bulkDeleteArticlesDto.ids);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.articlesService.remove(id);
  }

  @Put('bulk-assign-articles')
  bulkAssignCategory(@Body() bulkAssignCategoryDto: BulkAssignCategoryDto) {
    return this.articlesService.bulkArticlesCategoryAssign(
      bulkAssignCategoryDto.categoryId,
      bulkAssignCategoryDto.articleIds,
    );
  }
}
