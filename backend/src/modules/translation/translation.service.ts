import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { createHash } from 'node:crypto';
import type { TranslationConfig } from '@config/configuration';
import {
  TranslationCache,
  TranslationCacheDocument,
} from './schemas/translation-cache.schema';

const SOURCE_LANG = 'en';

/**
 * Free machine translation for CMS-authored public content (product/blog
 * copy, testimonials, FAQs, etc.) via MyMemory's free translation API —
 * no API key required, unlike Google/DeepL. Results are cached in Mongo
 * indefinitely (keyed by source text hash + target language) since CMS
 * content changes rarely and MyMemory's free tier has a daily word quota.
 * Static UI chrome (nav, buttons, forms) is translated separately via
 * i18next on the frontend and never goes through this service.
 */
@Injectable()
export class TranslationService {
  private readonly logger = new Logger(TranslationService.name);

  constructor(
    @InjectModel(TranslationCache.name)
    private readonly cacheModel: Model<TranslationCacheDocument>,
    private readonly configService: ConfigService,
  ) {}

  async translateText(text: string, targetLang: string): Promise<string> {
    if (!text || !text.trim() || targetLang === SOURCE_LANG) return text;

    const sourceHash = createHash('sha256').update(text).digest('hex');
    const cached = await this.cacheModel
      .findOne({ sourceHash, targetLang })
      .lean();
    if (cached) return cached.translatedText;

    try {
      const translatedText = await this.callProvider(text, targetLang);
      await this.cacheModel
        .findOneAndUpdate(
          { sourceHash, targetLang },
          { $setOnInsert: { sourceText: text.slice(0, 2000), translatedText } },
          { upsert: true },
        )
        .exec();
      return translatedText;
    } catch (error) {
      this.logger.warn(
        `Translation to "${targetLang}" failed, returning source text: ${(error as Error).message}`,
      );
      return text;
    }
  }

  /**
   * Translates the given string fields of a single document/plain object,
   * returning a plain object (doesn't mutate the input). No-op for `en`.
   * Accepts `any` for the input since callers pass Mongoose hydrated
   * documents, lean objects and plain DTOs interchangeably, but the
   * return value is always a concrete plain object shape.
   */
  async translateFields(
    doc: any,
    fields: string[],
    targetLang: string,
  ): Promise<Record<string, unknown> | null | undefined> {
    if (!doc || targetLang === SOURCE_LANG) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- `doc` is untyped input, see docstring above
      return doc;
    }

    const plain = this.toPlainObject(doc);

    await Promise.all(
      fields.map(async (field) => {
        const value = plain[field];
        if (typeof value === 'string' && value.trim()) {
          plain[field] = await this.translateText(value, targetLang);
        }
      }),
    );

    return plain;
  }

  /** Same as `translateFields`, applied across a list of documents. */
  async translateList(
    list: any[],
    fields: string[],
    targetLang: string,
  ): Promise<Record<string, unknown>[]> {
    if (targetLang === SOURCE_LANG || !list?.length) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- `list` is untyped input, see translateFields docstring
      return list;
    }
    const translated = await Promise.all(
      list.map((item) => this.translateFields(item, fields, targetLang)),
    );
    return translated as Record<string, unknown>[];
  }

  /** Converts a Mongoose hydrated document or plain object into a plain object, isolated so the unsafe `any` access lives in exactly one place. */
  private toPlainObject(doc: any): Record<string, unknown> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- doc is untyped input, see translateFields docstring
    if (typeof doc.toObject === 'function') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- doc is untyped input, see translateFields docstring
      return doc.toObject();
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- doc is untyped input, see translateFields docstring
    return { ...doc };
  }

  private async callProvider(
    text: string,
    targetLang: string,
  ): Promise<string> {
    const { contactEmail } = this.configService.get<TranslationConfig>(
      'translation',
    ) ?? { contactEmail: '' };

    const params = new URLSearchParams({
      q: text,
      langpair: `${SOURCE_LANG}|${targetLang}`,
    });
    if (contactEmail) params.set('de', contactEmail);

    const response = await fetch(
      `https://api.mymemory.translated.net/get?${params.toString()}`,
    );
    if (!response.ok) {
      throw new Error(`MyMemory responded with HTTP ${response.status}`);
    }

    const data = (await response.json()) as {
      responseStatus?: number;
      responseData?: { translatedText?: string };
    };

    if (data.responseStatus !== 200 || !data.responseData?.translatedText) {
      throw new Error('MyMemory returned no translation');
    }

    return data.responseData.translatedText;
  }
}
