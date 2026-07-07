"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var ImageGeneratorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageGeneratorService = void 0;
exports.parsePrompts = parsePrompts;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const archiver_1 = __importDefault(require("archiver"));
const stream_1 = require("stream");
const IMAGE_WIDTH = 1024;
const IMAGE_HEIGHT = 768;
const DELAY_BETWEEN_REQUESTS_MS = 2000;
const FETCH_TIMEOUT_MS = 120_000;
const MAX_ATTEMPTS_PER_IMAGE = 4;
const RETRY_BASE_DELAY_MS = 3_000;
const RATE_LIMIT_BASE_DELAY_MS = 8_000;
const JOB_TTL_MS = 30 * 60 * 1000;
function parsePrompts(content) {
    const lines = content.split('\n');
    const entries = [];
    let current = null;
    for (const line of lines) {
        const headerMatch = line.match(/^\[(.+?)\]\s+(\S+\.\w+)/);
        if (headerMatch) {
            if (current)
                entries.push(current);
            current = {
                tag: headerMatch[1].trim(),
                filename: headerMatch[2].trim(),
                prompt: '',
            };
            continue;
        }
        if (current) {
            const trimmed = line.trim();
            if (trimmed.length > 0) {
                current.prompt += (current.prompt ? ' ' : '') + trimmed;
            }
        }
    }
    if (current)
        entries.push(current);
    return entries;
}
let ImageGeneratorService = ImageGeneratorService_1 = class ImageGeneratorService {
    logger = new common_1.Logger(ImageGeneratorService_1.name);
    jobs = new Map();
    requestQueue = Promise.resolve();
    startJob(promptsFileContent) {
        const entries = parsePrompts(promptsFileContent);
        if (entries.length === 0) {
            throw new common_1.BadRequestException('No image entries found — expected lines like "[Blog 1] hero.jpg" followed by the prompt text.');
        }
        this.evictStaleJobs();
        const jobId = (0, crypto_1.randomUUID)();
        this.jobs.set(jobId, {
            status: 'running',
            total: entries.length,
            completed: 0,
            failures: [],
            createdAt: Date.now(),
        });
        void this.runJob(jobId, entries);
        return { jobId, total: entries.length };
    }
    getStatus(jobId) {
        const job = this.getJobOrThrow(jobId);
        return {
            status: job.status,
            total: job.total,
            completed: job.completed,
            failures: job.failures,
            error: job.error,
        };
    }
    getZip(jobId) {
        const job = this.getJobOrThrow(jobId);
        if (job.status === 'running') {
            throw new common_1.BadRequestException('This job has not finished generating yet');
        }
        if (job.status === 'failed' || !job.zipBuffer) {
            throw new common_1.BadRequestException(job.error || 'This job failed and has no zip to download');
        }
        return job.zipBuffer;
    }
    getJobOrThrow(jobId) {
        const job = this.jobs.get(jobId);
        if (!job) {
            throw new common_1.NotFoundException('Generation job not found (it may have expired) — try generating again');
        }
        return job;
    }
    async runJob(jobId, entries) {
        const job = this.jobs.get(jobId);
        if (!job)
            return;
        const archive = (0, archiver_1.default)('zip', { zlib: { level: 9 } });
        const chunks = [];
        const passthrough = new stream_1.PassThrough();
        const streamFinished = new Promise((resolve, reject) => {
            passthrough.on('data', (chunk) => chunks.push(chunk));
            passthrough.on('end', resolve);
            passthrough.on('error', reject);
            archive.on('error', reject);
        });
        archive.pipe(passthrough);
        try {
            for (const entry of entries) {
                try {
                    const buffer = await this.fetchImageWithRetry(entry.prompt, entry);
                    archive.append(buffer, { name: `${entry.tag}/${entry.filename}` });
                    this.logger.log(`Generated [${entry.tag}] ${entry.filename}`);
                }
                catch (error) {
                    const message = error instanceof Error ? error.message : String(error);
                    job.failures.push(`${entry.tag}/${entry.filename}: ${message}`);
                    this.logger.error(`Failed [${entry.tag}] ${entry.filename}: ${message}`);
                }
                job.completed += 1;
                await this.sleep(DELAY_BETWEEN_REQUESTS_MS);
            }
            if (job.failures.length === job.total) {
                job.status = 'failed';
                job.error = `All ${job.total} image(s) failed to generate: ${job.failures.join('; ')}`;
                return;
            }
            if (job.failures.length > 0) {
                archive.append(job.failures.join('\n'), { name: '_failed.txt' });
            }
            await archive.finalize();
            await streamFinished;
            job.zipBuffer = Buffer.concat(chunks);
            job.status = 'done';
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.logger.error(`Job ${jobId} failed while assembling the zip: ${message}`);
            job.status = 'failed';
            job.error = `Failed to assemble the zip: ${message}`;
        }
    }
    async fetchImageWithRetry(prompt, entry) {
        let lastError;
        for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_IMAGE; attempt++) {
            try {
                return await this.fetchImage(prompt);
            }
            catch (error) {
                lastError = error;
                const message = error instanceof Error ? error.message : String(error);
                const isRateLimited = message.includes('HTTP 429');
                const isLastAttempt = attempt === MAX_ATTEMPTS_PER_IMAGE;
                if (isLastAttempt)
                    break;
                const baseDelay = isRateLimited
                    ? RATE_LIMIT_BASE_DELAY_MS
                    : RETRY_BASE_DELAY_MS;
                const delay = baseDelay * 2 ** (attempt - 1);
                this.logger.warn(`[${entry.tag}] ${entry.filename} attempt ${attempt}/${MAX_ATTEMPTS_PER_IMAGE} failed (${message}) — retrying in ${delay}ms`);
                await this.sleep(delay);
            }
        }
        throw lastError instanceof Error
            ? lastError
            : new Error(String(lastError));
    }
    async enqueue(fn) {
        const previous = this.requestQueue;
        let release;
        this.requestQueue = new Promise((resolve) => (release = resolve));
        await previous;
        try {
            return await fn();
        }
        finally {
            release();
        }
    }
    async fetchImage(prompt) {
        return this.enqueue(() => this.fetchImageRaw(prompt));
    }
    async fetchImageRaw(prompt) {
        const seed = Math.floor(Math.random() * 1_000_000);
        const encodedPrompt = encodeURIComponent(prompt);
        const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${IMAGE_WIDTH}&height=${IMAGE_HEIGHT}&nologo=true&seed=${seed}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
        try {
            const res = await fetch(url, { signal: controller.signal });
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }
            return Buffer.from(await res.arrayBuffer());
        }
        catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                throw new Error(`timed out after ${FETCH_TIMEOUT_MS / 1000}s`);
            }
            throw error;
        }
        finally {
            clearTimeout(timeout);
        }
    }
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    evictStaleJobs() {
        const cutoff = Date.now() - JOB_TTL_MS;
        for (const [id, job] of this.jobs) {
            if (job.createdAt < cutoff)
                this.jobs.delete(id);
        }
    }
};
exports.ImageGeneratorService = ImageGeneratorService;
exports.ImageGeneratorService = ImageGeneratorService = ImageGeneratorService_1 = __decorate([
    (0, common_1.Injectable)()
], ImageGeneratorService);
//# sourceMappingURL=image-generator.service.js.map