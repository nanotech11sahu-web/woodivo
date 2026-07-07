export interface PromptEntry {
    tag: string;
    filename: string;
    prompt: string;
}
export type ImageGenJobStatusValue = 'running' | 'done' | 'failed';
export interface ImageGenJobStarted {
    jobId: string;
    total: number;
}
export interface ImageGenJobStatus {
    status: ImageGenJobStatusValue;
    total: number;
    completed: number;
    failures: string[];
    error?: string;
}
export declare function parsePrompts(content: string): PromptEntry[];
export declare class ImageGeneratorService {
    private readonly logger;
    private readonly jobs;
    private requestQueue;
    startJob(promptsFileContent: string): ImageGenJobStarted;
    getStatus(jobId: string): ImageGenJobStatus;
    getZip(jobId: string): Buffer;
    private getJobOrThrow;
    private runJob;
    private fetchImageWithRetry;
    private enqueue;
    private fetchImage;
    private fetchImageRaw;
    private sleep;
    private evictStaleJobs;
}
