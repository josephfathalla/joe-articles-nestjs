import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UnauthorizedException,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import {
  AllowAnonymous,
  Session,
  type UserSession,
} from '@thallesp/nestjs-better-auth';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(
    @Body() createCategoryDto: CreateCategoryDto,
    @Session() session: UserSession,
  ) {
    if (!session?.user?.id) {
      throw new UnauthorizedException('User must be authenticated');
    }
    return this.categoriesService.create(createCategoryDto, session.user.id);
  }

  @AllowAnonymous()
  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @AllowAnonymous()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Session() session: UserSession,
  ) {
    if (!session?.user?.id) {
      throw new UnauthorizedException('User must be authenticated');
    }
    return this.categoriesService.update(
      id,
      updateCategoryDto,
      session.user.id,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Session() session: UserSession) {
    if (!session?.user?.id) {
      throw new UnauthorizedException('User must be authenticated');
    }
    return this.categoriesService.remove(id, session.user.id);
  }
}
