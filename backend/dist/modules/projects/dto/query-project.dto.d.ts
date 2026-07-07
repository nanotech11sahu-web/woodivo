import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto";
import { ProjectStatus } from '../schemas/project.schema';
export declare class QueryProjectDto extends PaginationQueryDto {
    status?: ProjectStatus;
    category?: string;
    isFeatured?: boolean;
}
