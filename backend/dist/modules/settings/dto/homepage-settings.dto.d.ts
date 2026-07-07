import { HomepageHighlightIcon } from '../schemas/website-settings.schema';
export declare class HomepageHighlightDto {
    icon: HomepageHighlightIcon;
    title: string;
    description: string;
}
export declare class HomepageSettingsDto {
    whyWoodivoPoints?: HomepageHighlightDto[];
}
