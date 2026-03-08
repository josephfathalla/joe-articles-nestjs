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
  UnauthorizedException,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { BulkAssignCategoryDto } from './dto/bulk-assign-category.dto';
import { BulkDeleteArticlesDto } from './dto/bulk-delete-articles.dto';
import {
  AllowAnonymous,
  Session,
  type UserSession,
} from '@thallesp/nestjs-better-auth';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  create(
    @Body() createArticleDto: CreateArticleDto,
    @Session() session: UserSession,
  ) {
    if (!session?.user?.id) {
      throw new UnauthorizedException('User must be authenticated');
    }
    return this.articlesService.create(createArticleDto, session.user.id);
  }

  @Get('mine')
  findMine(
    @Query() paginationQuery: PaginationQueryDto,
    @Session() session: UserSession,
  ) {
    if (!session?.user?.id) {
      throw new UnauthorizedException('User must be authenticated');
    }
    return this.articlesService.findMine(paginationQuery, session.user.id);
  }

  @AllowAnonymous()
  @Get()
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.articlesService.findAll(paginationQuery);
  }

  @AllowAnonymous()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.articlesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateArticleDto: UpdateArticleDto,
    @Session() session: UserSession,
  ) {
    if (!session?.user?.id) {
      throw new UnauthorizedException('User must be authenticated');
    }
    return this.articlesService.update(id, updateArticleDto, session.user.id);
  }

  @Delete('bulk')
  bulkRemove(
    @Body() bulkDeleteArticlesDto: BulkDeleteArticlesDto,
    @Session() session: UserSession,
  ) {
    if (!session?.user?.id) {
      throw new UnauthorizedException('User must be authenticated');
    }
    return this.articlesService.removeBulk(
      bulkDeleteArticlesDto.ids,
      session.user.id,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Session() session: UserSession) {
    if (!session?.user?.id) {
      throw new UnauthorizedException('User must be authenticated');
    }
    return this.articlesService.remove(id, session.user.id);
  }

  @Put('bulk-assign-articles')
  bulkAssignCategory(@Body() bulkAssignCategoryDto: BulkAssignCategoryDto) {
    return this.articlesService.bulkArticlesCategoryAssign(
      bulkAssignCategoryDto.categoryId,
      bulkAssignCategoryDto.articleIds,
    );
  }
}
