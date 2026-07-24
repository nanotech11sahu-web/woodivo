import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'node:path';
import type { SocialConfig } from '@config/configuration';
import {
  BulkSocialResultItem,
  PostToSocialParams,
  PostToSocialResult,
} from './interfaces/post-to-social-params.interface';

const EXTENSION_BY_CONTENT_TYPE: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'video/mp4': '.mp4',
  'video/quicktime': '.mov',
};

/**
 * Talks to the Woodivo Social Publisher - a separately deployed service that
 * generates AI captions and publishes to Facebook/Instagram. This service
 * builds the seo.txt-formatted brief, downloads the media (Cloudinary URL)
 * into memory, and submits both to the Publisher's POST /posts endpoint.
 *
 * Deliberately has no knowledge of Product/Blog schemas - callers map their
 * own documents into PostToSocialParams.
 */
@Injectable()
export class SocialService {
  private readonly logger = new Logger(SocialService.name);

  constructor(private readonly configService: ConfigService) {}

  async postToSocial(params: PostToSocialParams): Promise<PostToSocialResult> {
    const config = this.configService.get<SocialConfig>('social');
    if (!config?.apiUrl || !config?.apiKey) {
      throw new Error(
        'SOCIAL_PUBLISHER_API_URL and SOCIAL_PUBLISHER_API_KEY must be configured to post to social media',
      );
    }

    const { buffer, contentType, extension } = await this.downloadMedia(
      params.mediaUrl,
    );

    const form = new FormData();
    form.append('seo', this.buildSeoText(params));
    form.append('sourceType', params.sourceType);
    form.append('sourceId', params.sourceId);
    form.append('sourceTitle', params.title);
    if (params.urgent) form.append('urgent', 'true');
    form.append(
      'media',
      new Blob([Uint8Array.from(buffer)], { type: contentType }),
      `media${extension}`,
    );

    const response = await fetch(`${config.apiUrl}/posts`, {
      method: 'POST',
      headers: { 'x-api-key': config.apiKey },
      body: form,
      signal: AbortSignal.timeout(config.requestTimeoutMs),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(
        `Social Publisher rejected the post (${response.status}): ${body || response.statusText}`,
      );
    }

    return (await response.json()) as PostToSocialResult;
  }

  /**
   * Posts each id's mapped content, collecting per-item success/failure so
   * a bulk request never lets one bad item abort the rest. Used identically
   * by Products and Blogs admin controllers - only `fetchAndMap` differs.
   */
  async postManyToSocial(
    ids: string[],
    fetchAndMap: (id: string) => Promise<PostToSocialParams>,
  ): Promise<BulkSocialResultItem[]> {
    const results: BulkSocialResultItem[] = [];

    for (const id of ids) {
      try {
        const params = await fetchAndMap(id);
        const result = await this.postToSocial(params);
        results.push({ id, success: true, reference: result.reference });
      } catch (error) {
        this.logger.error(
          `Failed to post ${id} to social: ${(error as Error).message}`,
        );
        results.push({ id, success: false, error: (error as Error).message });
      }
    }

    return results;
  }

  /**
   * Asks the Publisher to process pending folders right now instead of
   * waiting for the next scheduled slot - called once after an "urgent"
   * submission (or batch of them), not once per item.
   */
  async triggerNow(): Promise<{ triggered: boolean }> {
    const config = this.configService.get<SocialConfig>('social');
    if (!config?.apiUrl || !config?.apiKey) {
      throw new Error(
        'SOCIAL_PUBLISHER_API_URL and SOCIAL_PUBLISHER_API_KEY must be configured',
      );
    }

    const response = await fetch(`${config.apiUrl}/posts/trigger-now`, {
      method: 'POST',
      headers: { 'x-api-key': config.apiKey },
      signal: AbortSignal.timeout(config.requestTimeoutMs),
    });

    if (!response.ok) {
      throw new Error(
        `Social Publisher returned ${response.status} for trigger-now`,
      );
    }
    return (await response.json()) as { triggered: boolean };
  }

  /** Proxies the Publisher's public /health endpoint - no API key needed there. */
  async getHealth(): Promise<{ reachable: boolean; detail: unknown }> {
    const config = this.configService.get<SocialConfig>('social');
    if (!config?.apiUrl) {
      return {
        reachable: false,
        detail: { error: 'SOCIAL_PUBLISHER_API_URL is not configured' },
      };
    }

    try {
      const response = await fetch(`${config.apiUrl}/health`, {
        signal: AbortSignal.timeout(10_000),
      });
      const detail: unknown = await response.json().catch(() => null);
      return { reachable: response.ok, detail };
    } catch (error) {
      return { reachable: false, detail: { error: (error as Error).message } };
    }
  }

  /** Proxies the Publisher's GET /posts - powers Woodivo's CMS status table. */
  async listPosts(page: number, limit: number): Promise<unknown> {
    const config = this.configService.get<SocialConfig>('social');
    if (!config?.apiUrl || !config?.apiKey) {
      throw new Error(
        'SOCIAL_PUBLISHER_API_URL and SOCIAL_PUBLISHER_API_KEY must be configured',
      );
    }

    const response = await fetch(
      `${config.apiUrl}/posts?page=${encodeURIComponent(page)}&limit=${encodeURIComponent(limit)}`,
      {
        headers: { 'x-api-key': config.apiKey },
        signal: AbortSignal.timeout(config.requestTimeoutMs),
      },
    );

    if (!response.ok) {
      throw new Error(
        `Social Publisher returned ${response.status} for post list`,
      );
    }
    return response.json();
  }

  /** Proxies the Publisher's GET /posts/:id. */
  async getPost(id: string): Promise<unknown> {
    const config = this.configService.get<SocialConfig>('social');
    if (!config?.apiUrl || !config?.apiKey) {
      throw new Error(
        'SOCIAL_PUBLISHER_API_URL and SOCIAL_PUBLISHER_API_KEY must be configured',
      );
    }

    const response = await fetch(
      `${config.apiUrl}/posts/${encodeURIComponent(id)}`,
      {
        headers: { 'x-api-key': config.apiKey },
        signal: AbortSignal.timeout(config.requestTimeoutMs),
      },
    );

    if (!response.ok) {
      throw new Error(
        `Social Publisher returned ${response.status} for post ${id}`,
      );
    }
    return response.json();
  }

  private async downloadMedia(
    mediaUrl: string,
  ): Promise<{ buffer: Buffer; contentType: string; extension: string }> {
    const response = await fetch(mediaUrl);
    if (!response.ok) {
      throw new Error(
        `Failed to download media from ${mediaUrl} (${response.status})`,
      );
    }

    const contentType =
      response.headers.get('content-type') ?? 'application/octet-stream';
    const buffer = Buffer.from(await response.arrayBuffer());

    const urlExtension = path.extname(new URL(mediaUrl).pathname).toLowerCase();
    const knownExtensions = new Set(Object.values(EXTENSION_BY_CONTENT_TYPE));
    const extension = knownExtensions.has(urlExtension)
      ? urlExtension
      : (EXTENSION_BY_CONTENT_TYPE[contentType] ?? (urlExtension || '.jpg'));

    return { buffer, contentType, extension };
  }

  private buildSeoText(params: PostToSocialParams): string {
    const lines = [
      `Title: ${params.title}`,
      `Description: ${params.description}`,
      `Keywords: ${params.keywords.join(', ')}`,
    ];

    if (params.tone) lines.push(`Tone: ${params.tone}`);
    if (params.cta) lines.push(`CTA: ${params.cta}`);
    if (params.website) lines.push(`Website: ${params.website}`);
    if (params.phone) lines.push(`Phone: ${params.phone}`);

    lines.push(`Platforms: ${params.platforms.join(', ')}`);
    lines.push(`Language: ${params.language ?? 'English'}`);

    if (params.additionalInstructions) {
      lines.push(`Additional Instructions: ${params.additionalInstructions}`);
    }

    return lines.join('\n');
  }
}
