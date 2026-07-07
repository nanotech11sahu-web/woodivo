import { MediaAssetDto } from "../../../common/dto/media-asset.dto";
import { TestimonialStatus } from '../schemas/testimonial.schema';
export declare class CreateTestimonialDto {
    clientName: string;
    clientLocation?: string;
    projectType?: string;
    clientPhoto?: MediaAssetDto;
    testimonialText: string;
    rating?: number;
    isFeatured?: boolean;
    displayOrder?: number;
    status?: TestimonialStatus;
}
