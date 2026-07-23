import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from '@common/decorators/public.decorator';
import { TranslationService } from '@modules/translation/translation.service';
import { BlogsService } from './blogs.service';
import { BlogCategoriesService } from './blog-categories.service';
import { QueryPublicBlogDto } from './dto/query-public-blog.dto';

// `content` (Markdown) is deliberately excluded — machine-translating
// Markdown risks mangling links/formatting/FAQ blocks. Title and excerpt
// are plain text and safe to translate.
const TRANSLATABLE_FIELDS = ['title', 'excerpt'];

@Public()
@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly blogCategoriesService: BlogCategoriesService,
    private readonly translationService: TranslationService,
  ) {}

  @Get()
  async findAll(@Query() query: QueryPublicBlogDto) {
    const result = await this.blogsService.findAllPublic(query);
    const items = await this.translationService.translateList(
      result.items,
      TRANSLATABLE_FIELDS,
      query.lang ?? 'en',
    );
    return { ...result, items };
  }

  @Get('latest')
  async findLatest(@Query('limit') limit?: string, @Query('lang') lang = 'en') {
    const blogs = await this.blogsService.findLatestPublic(
      limit ? Number(limit) : undefined,
    );
    return this.translationService.translateList(
      blogs,
      TRANSLATABLE_FIELDS,
      lang,
    );
  }

  @Get('categories')
  findCategories() {
    return this.blogCategoriesService.findAll();
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string, @Query('lang') lang = 'en') {
    const blog = await this.blogsService.findBySlugPublic(slug);
    return this.translationService.translateFields(
      blog,
      TRANSLATABLE_FIELDS,
      lang,
    );
  }
}
