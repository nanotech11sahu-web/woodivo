import { Model } from 'mongoose';
import { EnquiryDocument, EnquiryStatus } from './schemas/enquiry.schema';
import { CategoryDocument } from "../categories/schemas/category.schema";
import { MailService } from "../mail/mail.service";
import { PaginatedResult } from "../../common/interfaces/paginated-result.interface";
import { CreateEnquiryDto } from './dto/create-enquiry.dto';
import { UpdateEnquiryDto } from './dto/update-enquiry.dto';
import { QueryEnquiryDto } from './dto/query-enquiry.dto';
export interface EnquiryStatsSummary {
    total: number;
    byStatus: Record<EnquiryStatus, number>;
}
export declare class EnquiriesService {
    private readonly enquiryModel;
    private readonly categoryModel;
    private readonly mailService;
    constructor(enquiryModel: Model<EnquiryDocument>, categoryModel: Model<CategoryDocument>, mailService: MailService);
    create(dto: CreateEnquiryDto): Promise<EnquiryDocument>;
    findAllAdmin(query: QueryEnquiryDto): Promise<PaginatedResult<EnquiryDocument>>;
    findByIdAdmin(id: string): Promise<EnquiryDocument>;
    update(id: string, dto: UpdateEnquiryDto): Promise<EnquiryDocument>;
    remove(id: string): Promise<void>;
    getStats(): Promise<EnquiryStatsSummary>;
}
