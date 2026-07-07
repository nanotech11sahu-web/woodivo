import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from '@common/decorators/public.decorator';
import { BlogsService } from './blogs.service';
import { BlogCategoriesService } from './blog-categories.service';
import { QueryPublicBlogDto } from './dto/query-public-blog.dto';

@Public()
@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly blogCategoriesService: BlogCategoriesService,
  ) {}

  @Get()
  findAll(@Query() query: QueryPublicBlogDto) {
    return this.blogsService.findAllPublic(query);
  }

  @Get('latest')
  findLatest(@Query('limit') limit?: string) {
    return this.blogsService.findLatestPublic(
      limit ? Number(limit) : undefined,
    );
  }

  @Get('categories')
  findCategories() {
    return this.blogCategoriesService.findAll();
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.blogsService.findBySlugPublic(slug);
  }
}
