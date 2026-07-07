import { MediaAssetDto } from "../../../common/dto/media-asset.dto";
import { ValueItemDto } from './value-item.dto';
import { MilestoneDto } from './milestone.dto';
import { TeamMemberDto } from './team-member.dto';
export declare class UpdateAboutPageDto {
    heroTitle?: string;
    heroSubtitle?: string;
    heroImage?: MediaAssetDto;
    storyTitle?: string;
    storyContent?: string;
    storyImage?: MediaAssetDto;
    missionText?: string;
    visionText?: string;
    values?: ValueItemDto[];
    milestones?: MilestoneDto[];
    teamTitle?: string;
    teamSubtitle?: string;
    teamMembers?: TeamMemberDto[];
    ctaTitle?: string;
    ctaText?: string;
}
