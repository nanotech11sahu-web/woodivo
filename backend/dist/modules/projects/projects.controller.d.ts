import { ProjectsService } from './projects.service';
import { QueryPublicProjectDto } from './dto/query-public-project.dto';
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    findAll(query: QueryPublicProjectDto): Promise<import("../../common/interfaces/paginated-result.interface").PaginatedResult<import("mongoose").Document<unknown, {}, import("./schemas/project.schema").Project, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/project.schema").Project & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>>;
    findOne(slug: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/project.schema").Project, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/project.schema").Project & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
}
