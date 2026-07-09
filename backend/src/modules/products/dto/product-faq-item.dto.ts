import { IsString, MaxLength } from 'class-validator';

/** Per-product FAQ pair, embedded on the product document — mirrors
 * `BlogFaqItemDto` (modules/blogs/dto/blog-faq-item.dto.ts). Distinct from
 * the site-wide `FaqSchema` in modules/faqs (homepage FAQs, its own
 * collection). */
export class ProductFaqItemDto {
  @IsString()
  @MaxLength(300)
  question!: string;

  @IsString()
  answer!: string;
}
