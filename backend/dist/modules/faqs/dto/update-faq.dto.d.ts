import { FaqStatus } from '../schemas/faq.schema';
export declare class UpdateFaqDto {
    question?: string;
    answer?: string;
    group?: string;
    displayOrder?: number;
    status?: FaqStatus;
}
