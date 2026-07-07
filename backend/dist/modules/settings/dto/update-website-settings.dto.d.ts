import { MediaAssetDto } from "../../../common/dto/media-asset.dto";
import { ContactInfoDto } from './contact-info.dto';
import { SocialLinksDto } from './social-links.dto';
import { FooterSettingsDto } from './footer-settings.dto';
import { HomepageSettingsDto } from './homepage-settings.dto';
export declare class UpdateWebsiteSettingsDto {
    siteName?: string;
    tagline?: string;
    logo?: MediaAssetDto;
    favicon?: MediaAssetDto;
    contact?: ContactInfoDto;
    socialLinks?: SocialLinksDto;
    footer?: FooterSettingsDto;
    homepage?: HomepageSettingsDto;
    googleAnalyticsId?: string;
    facebookPixelId?: string;
}
