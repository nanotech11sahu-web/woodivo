import type { Response } from 'express';
import { ImageGeneratorService } from './image-generator.service';
import { DraftBlogUploaderService } from './draft-blog-uploader.service';
export declare class ToolsAdminController {
    private readonly imageGeneratorService;
    private readonly draftBlogUploaderService;
    constructor(imageGeneratorService: ImageGeneratorService, draftBlogUploaderService: DraftBlogUploaderService);
    startImageGeneration(file: Express.Multer.File): import("./image-generator.service").ImageGenJobStarted;
    getImageGenerationStatus(jobId: string): import("./image-generator.service").ImageGenJobStatus;
    downloadImageGenerationZip(jobId: string, res: Response): void;
    listDraftZips(): import("./draft-blog-uploader.service").PendingDraftZip[];
    uploadDraftZip(file: Express.Multer.File): import("./draft-blog-uploader.service").PendingDraftZip;
    removeDraftZip(filename: string): {
        removed: string;
    };
    runDraftBlogUploader(): Promise<import("./draft-blog-uploader.service").DraftZipResult[]>;
}
