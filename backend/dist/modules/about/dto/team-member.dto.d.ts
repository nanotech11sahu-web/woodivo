import { MediaAssetDto } from "../../../common/dto/media-asset.dto";
export declare class TeamMemberDto {
    name: string;
    role: string;
    photo?: MediaAssetDto;
    bio?: string;
}
