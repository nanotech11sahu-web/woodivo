import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { SocialConfig } from '@config/configuration';
import type {
  AutoReplyRule,
  CreateAutoReplyRuleParams,
  UpdateAutoReplyRuleParams,
} from './interfaces/auto-reply-rule.interface';

/**
 * Proxies auto-reply rule CRUD to the Social Publisher, exactly like
 * SocialService proxies /posts - same shared-secret x-api-key auth, same
 * "this app has no local copy of the data" shape.
 */
@Injectable()
export class AutoReplyRulesService {
  constructor(private readonly configService: ConfigService) {}

  private baseHeaders(): { url: string; headers: Record<string, string> } {
    const config = this.configService.get<SocialConfig>('social');
    if (!config?.apiUrl || !config?.apiKey) {
      throw new Error(
        'SOCIAL_PUBLISHER_API_URL and SOCIAL_PUBLISHER_API_KEY must be configured',
      );
    }
    return {
      url: `${config.apiUrl}/admin/auto-reply-rules`,
      headers: { 'x-api-key': config.apiKey },
    };
  }

  async findAll(): Promise<AutoReplyRule[]> {
    const { url, headers } = this.baseHeaders();
    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error(`Social Publisher returned ${response.status}`);
    return response.json();
  }

  async findOne(id: string): Promise<AutoReplyRule> {
    const { url, headers } = this.baseHeaders();
    const response = await fetch(`${url}/${encodeURIComponent(id)}`, { headers });
    if (!response.ok) throw new Error(`Social Publisher returned ${response.status}`);
    return response.json();
  }

  async create(params: CreateAutoReplyRuleParams): Promise<AutoReplyRule> {
    const { url, headers } = this.baseHeaders();
    const response = await fetch(url, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!response.ok) throw new Error(`Social Publisher returned ${response.status}`);
    return response.json();
  }

  async update(id: string, params: UpdateAutoReplyRuleParams): Promise<AutoReplyRule> {
    const { url, headers } = this.baseHeaders();
    const response = await fetch(`${url}/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!response.ok) throw new Error(`Social Publisher returned ${response.status}`);
    return response.json();
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const { url, headers } = this.baseHeaders();
    const response = await fetch(`${url}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) throw new Error(`Social Publisher returned ${response.status}`);
    return response.json();
  }
}
