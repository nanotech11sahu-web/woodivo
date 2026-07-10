import { MediaAssetDto } from "../../../common/dto/media-asset.dto";
import { BannerPlacement, BannerStatus } from '../schemas/banner.schema';
export declare class CreateBannerDto {
    title: string;
    subtitle?: string;
    desktopImage: MediaAssetDto;
    mobileImage?: MediaAssetDto;
    ctaLabel?: string;
    ctaLink?: string;
    placement?: BannerPlacement;
    displayOrder?: number;
    status?: BannerStatus;
}
