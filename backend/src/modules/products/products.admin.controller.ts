import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Types } from 'mongoose';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@common/constants/app.constants';
import type { AppConfig } from '@config/configuration';
import { SocialService } from '@modules/social/social.service';
import type { PostToSocialParams } from '@modules/social/interfaces/post-to-social-params.interface';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { PostToSocialDto } from '@modules/social/dto/post-to-social.dto';
import { ProductDocument, ProductStatus } from './schemas/product.schema';

@Controller('admin/products')
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR)
export class ProductsAdminController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly socialService: SocialService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  findAll(@Query() query: QueryProductDto) {
    return this.productsService.findAllAdmin(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findByIdAdmin(id);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Patch(':id/status')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  setStatus(@Param('id') id: string, @Body('status') status: ProductStatus) {
    return this.productsService.setStatus(id, status);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  // No @Roles override - inherits the controller-level SUPER_ADMIN/ADMIN/EDITOR
  // from above. Accepts one id or many (bulk = same request, more ids).
  @Post('post-to-social')
  async postToSocial(@Body() dto: PostToSocialDto) {
    const results = await this.socialService.postManyToSocial(dto.ids, (id) =>
      this.buildSocialParams(id, dto),
    );

    if (dto.postNow && results.some((result) => result.success)) {
      // Best-effort: the posts are already queued regardless, so a failed
      // trigger just means they wait for the next scheduled slot instead.
      await this.socialService.triggerNow().catch(() => undefined);
    }

    return { results };
  }

  private async buildSocialParams(
    id: string,
    overrides: PostToSocialDto,
  ): Promise<PostToSocialParams> {
    const product = await this.productsService.findByIdAdmin(id);
    return mapProductToSocialParams(product, overrides, this.configService);
  }
}

/**
 * Exported so a future bulk endpoint elsewhere (or a test) can reuse the
 * exact same mapping without going through the controller.
 */
export function mapProductToSocialParams(
  product: ProductDocument,
  overrides: PostToSocialDto,
  configService: ConfigService,
): PostToSocialParams {
  const mediaUrl = product.images?.[0]?.url;
  if (!mediaUrl) {
    throw new Error(`Product "${product.name}" has no image to post`);
  }

  const category = product.category as unknown as
    { name?: string } | Types.ObjectId;
  const categoryName =
    typeof category === 'object' && 'name' in category
      ? category.name
      : undefined;

  const publicSiteUrl = configService.get<AppConfig>('app')?.publicSiteUrl;
  const website = publicSiteUrl
    ? `${publicSiteUrl}/products/${product.slug}`
    : undefined;

  return {
    title: product.name,
    description:
      product.description ?? `${product.name} - handcrafted and available now.`,
    keywords: [categoryName, product.name].filter((v): v is string =>
      Boolean(v),
    ),
    tone: overrides.tone ?? 'warm and inviting, premium but approachable',
    cta: overrides.cta ?? 'Shop now or get in touch to order',
    website,
    platforms: overrides.platforms?.length
      ? overrides.platforms
      : ['Facebook', 'Instagram'],
    language: 'English',
    additionalInstructions: overrides.additionalInstructions,
    mediaUrl,
    sourceType: 'PRODUCT',
    sourceId: String(product._id),
    urgent: overrides.postNow,
  };
}
