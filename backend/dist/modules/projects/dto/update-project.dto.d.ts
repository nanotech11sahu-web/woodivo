import { MediaAssetDto } from "../../../common/dto/media-asset.dto";
import { ProjectStatus } from '../schemas/project.schema';
export declare class UpdateProjectDto {
    title?: string;
    slug?: string;
    description?: string;
    clientName?: string;
    location?: string;
    completionYear?: string;
    category?: string;
    coverImage?: MediaAssetDto;
    images?: MediaAssetDto[];
    isFeatured?: boolean;
    displayOrder?: number;
    status?: ProjectStatus;
}
