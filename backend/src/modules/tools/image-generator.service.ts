import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import archiver from 'archiver';
import { PassThrough } from 'stream';

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

interface ImageGenJob extends ImageGenJobStatus {
  zipBuffer?: Buffer;
  createdAt: number;
}

const IMAGE_WIDTH = 1024;
const DELAY_BETWEEN_REQUESTS_MS = 2000;
const FETCH_TIMEOUT_MS = 30_000;
// Unsplash's free tier throttles to 50 req/hour — retry transient failures
// (500/timeout/429) instead of giving up after one shot. 429 gets a longer,
// increasing backoff since it's an explicit "slow down" signal.
const MAX_ATTEMPTS_PER_IMAGE = 4;
const RETRY_BASE_DELAY_MS = 3_000;
const RATE_LIMIT_BASE_DELAY_MS = 8_000;
// Jobs are only ever read right after they finish downloading; sweep anything
// left over from an abandoned tab so this Map doesn't grow forever.
const JOB_TTL_MS = 30 * 60 * 1000;

/**
 * Same [tag] filename.ext / prompt-text-below format the standalone
 * generate-images.js script used — the CMS upload just replaces the CLI
 * argument, parsing logic is unchanged.
 */
export function parsePrompts(content: string): PromptEntry[] {
  const lines = content.split('\n');
  const entries: PromptEntry[] = [];
  let current: PromptEntry | null = null;

  for (const line of lines) {
    const headerMatch = line.match(/^\[(.+?)\]\s+(\S+\.\w+)/);

    if (headerMatch) {
      if (current) entries.push(current);
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

  if (current) entries.push(current);
  return entries;
}

@Injectable()
export class ImageGeneratorService {
  private readonly logger = new Logger(ImageGeneratorService.name);
  private readonly jobs = new Map<string, ImageGenJob>();
  // The standalone CLI script only ever had one process, one request in
  // flight, ever. The backend has no such guarantee — two jobs started
  // close together (two admins, or a retry from the same admin) would
  // interleave requests to pollinations.ai with no combined rate limiting,
  // which is a much likelier source of 429/500s than anything about a
  // single job on its own. This chain forces every image request across
  // every job through one at a time, in order, same as the CLI ever did.
  private requestQueue: Promise<void> = Promise.resolve();

  /**
   * Kicks off generation in the background and returns immediately with a
   * jobId — the batch used to run inline on the request, which is why the
   * CMS spinner had nothing to show and could sit there for however long the
   * whole batch (images * (generation time + 2s delay)) took, or hang
   * forever if pollinations.ai never responded at all.
   */
  startJob(promptsFileContent: string): ImageGenJobStarted {
    const entries = parsePrompts(promptsFileContent);
    if (entries.length === 0) {
      throw new BadRequestException(
        'No image entries found — expected lines like "[Blog 1] hero.jpg" followed by the prompt text.',
      );
    }

    this.evictStaleJobs();

    const jobId = randomUUID();
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

  getStatus(jobId: string): ImageGenJobStatus {
    const job = this.getJobOrThrow(jobId);
    return {
      status: job.status,
      total: job.total,
      completed: job.completed,
      failures: job.failures,
      error: job.error,
    };
  }

  getZip(jobId: string): Buffer {
    const job = this.getJobOrThrow(jobId);
    if (job.status === 'running') {
      throw new BadRequestException('This job has not finished generating yet');
    }
    if (job.status === 'failed' || !job.zipBuffer) {
      throw new BadRequestException(
        job.error || 'This job failed and has no zip to download',
      );
    }
    return job.zipBuffer;
  }

  private getJobOrThrow(jobId: string): ImageGenJob {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new NotFoundException(
        'Generation job not found (it may have expired) — try generating again',
      );
    }
    return job;
  }

  private async runJob(jobId: string, entries: PromptEntry[]): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) return;

    const archive = archiver('zip', { zlib: { level: 9 } });
    const chunks: Buffer[] = [];
    const passthrough = new PassThrough();

    // Registered up front, not after finalize() — passthrough.on('data', ...)
    // switches the stream into flowing mode immediately, so for a small
    // batch it can fully drain and emit 'end' before code further down ever
    // gets a chance to listen for it. Attaching 'end' here, alongside
    // 'data', means we can never miss it.
    const streamFinished = new Promise<void>((resolve, reject) => {
      passthrough.on('data', (chunk: Buffer) => chunks.push(chunk));
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
        } catch (error) {
          const message =
            error instanceof Error ? error.message : String(error);
          job.failures.push(`${entry.tag}/${entry.filename}: ${message}`);
          this.logger.error(
            `Failed [${entry.tag}] ${entry.filename}: ${message}`,
          );
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
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Job ${jobId} failed while assembling the zip: ${message}`,
      );
      job.status = 'failed';
      job.error = `Failed to assemble the zip: ${message}`;
    }
  }

  /**
   * Wraps fetchImage with retries. pollinations.ai fails a meaningful chunk
   * of requests in a batch (500s, timeouts, and 429 rate limiting) — one
   * request per image just isn't reliable enough, especially since a fixed
   * 2s gap between *different* images doesn't back off at all once the API
   * starts rate limiting. 429s get a longer, increasing delay than plain
   * 500s/timeouts since they're an explicit "you're going too fast" signal.
   */
  private async fetchImageWithRetry(
    prompt: string,
    entry: PromptEntry,
  ): Promise<Buffer> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_IMAGE; attempt++) {
      try {
        return await this.fetchImage(prompt);
      } catch (error) {
        lastError = error;
        const message = error instanceof Error ? error.message : String(error);
        const isRateLimited = message.includes('HTTP 429');
        const isLastAttempt = attempt === MAX_ATTEMPTS_PER_IMAGE;

        if (isLastAttempt) break;

        const baseDelay = isRateLimited
          ? RATE_LIMIT_BASE_DELAY_MS
          : RETRY_BASE_DELAY_MS;
        // exponential backoff: base * 2^(attempt-1)
        const delay = baseDelay * 2 ** (attempt - 1);

        this.logger.warn(
          `[${entry.tag}] ${entry.filename} attempt ${attempt}/${MAX_ATTEMPTS_PER_IMAGE} failed (${message}) — retrying in ${delay}ms`,
        );
        await this.sleep(delay);
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new Error(String(lastError));
  }

  /**
   * Runs fn() only after every previously queued image request (from any
   * job) has finished — serializing all pollinations.ai traffic across the
   * whole service instead of just within one job.
   */
  private async enqueue<T>(fn: () => Promise<T>): Promise<T> {
    const previous = this.requestQueue;
    let release: () => void;
    this.requestQueue = new Promise((resolve) => (release = resolve));
    await previous;
    try {
      return await fn();
    } finally {
      release!();
    }
  }

  private async fetchImage(prompt: string): Promise<Buffer> {
    return this.enqueue(() => this.fetchImageRaw(prompt));
  }

  /**
   * Unsplash is search-based, not generative — the "prompt" text from the
   * prompts file is used as a search query and we take the top real-photo
   * match, rather than generating pixels from scratch like pollinations.ai
   * did. Requires UNSPLASH_ACCESS_KEY (free, no card, from
   * unsplash.com/developers).
   */
  private async fetchImageRaw(prompt: string): Promise<Buffer> {
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;
    if (!accessKey) {
      throw new Error(
        'UNSPLASH_ACCESS_KEY is not configured on the backend — add it to backend/.env',
      );
    }

    const searchUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(prompt)}&per_page=1&orientation=landscape`;

    const searchRes = await this.fetchWithTimeout(searchUrl, {
      headers: { Authorization: `Client-ID ${accessKey}` },
    });
    if (!searchRes.ok) {
      throw new Error(`HTTP ${searchRes.status} (Unsplash search)`);
    }
    const searchData = (await searchRes.json()) as {
      results: Array<{
        urls: { raw: string };
        links: { download_location: string };
      }>;
    };
    const photo = searchData.results?.[0];
    if (!photo) {
      throw new Error(`no Unsplash results for "${prompt}"`);
    }

    // Required by Unsplash's API guidelines whenever a photo is downloaded
    // for use — fire-and-forget, a failure here shouldn't fail the image.
    this.fetchWithTimeout(photo.links.download_location, {
      headers: { Authorization: `Client-ID ${accessKey}` },
    }).catch(() => undefined);

    const imageRes = await this.fetchWithTimeout(
      `${photo.urls.raw}&w=${IMAGE_WIDTH}&fit=max&q=80`,
    );
    if (!imageRes.ok) {
      throw new Error(`HTTP ${imageRes.status} (Unsplash image download)`);
    }
    return Buffer.from(await imageRes.arrayBuffer());
  }

  private async fetchWithTimeout(
    url: string,
    init?: { headers?: Record<string, string> },
  ): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      return await fetch(url, { ...init, signal: controller.signal });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`timed out after ${FETCH_TIMEOUT_MS / 1000}s`);
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private evictStaleJobs(): void {
    const cutoff = Date.now() - JOB_TTL_MS;
    for (const [id, job] of this.jobs) {
      if (job.createdAt < cutoff) this.jobs.delete(id);
    }
  }
}
