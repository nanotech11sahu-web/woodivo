import { MediaAssetDto } from "../../../common/dto/media-asset.dto";
import { BlogStatus } from '../schemas/blog.schema';
import { BlogFaqItemDto } from './blog-faq-item.dto';
export declare class CreateBlogDto {
    title: string;
    slug?: string;
    excerpt?: string;
    content: string;
    featuredImage?: MediaAssetDto;
    category?: string;
    tags?: string[];
    status?: BlogStatus;
    publishAt?: string;
    isFeatured?: boolean;
    authorName?: string;
    images?: MediaAssetDto[];
    faqs?: BlogFaqItemDto[];
}
