import { IsString, MaxLength } from 'class-validator';

/** Per-post FAQ pair, embedded on the blog document — distinct from the
 * site-wide `FaqSchema` in modules/faqs (homepage FAQs, its own collection). */
export class BlogFaqItemDto {
  @IsString()
  @MaxLength(300)
  question!: string;

  @IsString()
  answer!: string;
}
