import { ReorderItemsDto } from "../../common/dto/reorder-items.dto";
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { QueryProjectDto } from './dto/query-project.dto';
import { ProjectStatus } from './schemas/project.schema';
export declare class ProjectsAdminController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    findAll(query: QueryProjectDto): Promise<import("../../common/interfaces/paginated-result.interface").PaginatedResult<import("mongoose").Document<unknown, {}, import("./schemas/project.schema").Project, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/project.schema").Project & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/project.schema").Project, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/project.schema").Project & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    create(dto: CreateProjectDto): Promise<import("mongoose").Document<unknown, {}, import("./schemas/project.schema").Project, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/project.schema").Project & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    reorder(dto: ReorderItemsDto): Promise<void>;
    setStatus(id: string, status: ProjectStatus): Promise<import("mongoose").Document<unknown, {}, import("./schemas/project.schema").Project, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/project.schema").Project & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    update(id: string, dto: UpdateProjectDto): Promise<import("mongoose").Document<unknown, {}, import("./schemas/project.schema").Project, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/project.schema").Project & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    remove(id: string): Promise<void>;
}
