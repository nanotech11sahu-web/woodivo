import { Model } from 'mongoose';
import { ProjectDocument, ProjectStatus } from './schemas/project.schema';
import { CategoryDocument } from "../categories/schemas/category.schema";
import { PaginatedResult } from "../../common/interfaces/paginated-result.interface";
import { ReorderItemsDto } from "../../common/dto/reorder-items.dto";
import { SeoEntriesService } from "../seo-entries/seo-entries.service";
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { QueryProjectDto } from './dto/query-project.dto';
import { QueryPublicProjectDto } from './dto/query-public-project.dto';
export declare class ProjectsService {
    private readonly projectModel;
    private readonly categoryModel;
    private readonly seoEntriesService;
    constructor(projectModel: Model<ProjectDocument>, categoryModel: Model<CategoryDocument>, seoEntriesService: SeoEntriesService);
    create(dto: CreateProjectDto): Promise<ProjectDocument>;
    findAllAdmin(query: QueryProjectDto): Promise<PaginatedResult<ProjectDocument>>;
    findAllPublic(query: QueryPublicProjectDto): Promise<PaginatedResult<ProjectDocument>>;
    findByIdAdmin(id: string): Promise<ProjectDocument>;
    findBySlugPublic(slug: string): Promise<ProjectDocument>;
    update(id: string, dto: UpdateProjectDto): Promise<ProjectDocument>;
    remove(id: string): Promise<void>;
    private syncSeoEntry;
    reorder(dto: ReorderItemsDto): Promise<void>;
    setStatus(id: string, status: ProjectStatus): Promise<ProjectDocument>;
    private getCategoryOrThrow;
    private ensureSlugAvailable;
}
