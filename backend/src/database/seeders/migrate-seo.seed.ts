/**
 * One-off migration — run once, right after deploying this phase, BEFORE
 * relying on the centralized SEO CMS section. NOT wired into
 * `onApplicationBootstrap` (same reasoning as `demo-data.seed.ts`): this
 * touches every existing Product/Blog/Category/Project/AboutPage/
 * WebsiteSettings document exactly once and has nothing useful to do on
 * a second run, so it doesn't belong in the every-boot path.
 *
 * Why raw `.collection.find()` instead of the typed Mongoose models:
 * `seo` was removed from every schema in this phase, so a normal
 * `Model.find()` (strict mode, the project default) silently drops that
 * field from the result even though it's still sitting in MongoDB. Only
 * the native driver's `.collection` accessor bypasses schema filtering
 * and can actually see it — this is the one legitimate reason to reach
 * past Mongoose here rather than a sign something's wrong.
 *
 * Idempotent: `SeoEntriesService.syncForEntity()` create-if-missing /
 * update-if-slug-changed logic already handles being called against an
 * entity that's run through this script before, so re-running this is
 * harmless — it just re-confirms the same rows. It will NOT overwrite an
 * SEO entry's meta fields if one already exists for that entity (e.g.
 * from a previous partial run), only creates it if missing.
 */
import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Logger } from '@nestjs/common';
import { Model } from 'mongoose';

import { AppModule } from '../../app.module';
import { Product } from '@modules/products/schemas/product.schema';
import { Blog } from '@modules/blogs/schemas/blog.schema';
import { Category } from '@modules/categories/schemas/category.schema';
import { Project } from '@modules/projects/schemas/project.schema';
import { AboutPage } from '@modules/about/schemas/about-page.schema';
import { WebsiteSettings } from '@modules/settings/schemas/website-settings.schema';
import {
  SeoEntry,
  SeoPageType,
} from '@modules/seo-entries/schemas/seo-entry.schema';

const logger = new Logger('MigrateSeo');

interface LegacySeoMeta {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  ogImage?: string;
  canonicalUrl?: string;
}

function hasAnyValue(seo: LegacySeoMeta | undefined): boolean {
  if (!seo) return false;
  return Boolean(
    seo.metaTitle ||
    seo.metaDescription ||
    seo.canonicalUrl ||
    seo.ogImage ||
    (seo.metaKeywords && seo.metaKeywords.length > 0),
  );
}

async function migrateCollection(
  model: Model<unknown>,
  pageType: SeoPageType,
  buildPath: (doc: Record<string, unknown>) => string | undefined,
  labelField: string,
  seoEntryModel: Model<unknown>,
): Promise<{ migrated: number; skipped: number }> {
  const docs = await model.collection
    .find<Record<string, unknown>>({})
    .toArray();

  let migrated = 0;
  let skipped = 0;

  for (const doc of docs) {
    const legacySeo = doc.seo as LegacySeoMeta | undefined;
    const path = buildPath(doc);
    if (!path) {
      skipped++;
      continue;
    }

    const alreadyMigrated = await seoEntryModel.exists({
      entityId: doc._id,
      pageType,
    });
    if (alreadyMigrated) {
      skipped++;
      continue;
    }

    const rawLabel = doc[labelField];
    const entityLabel = typeof rawLabel === 'string' ? rawLabel : '';

    await seoEntryModel.create({
      path,
      pageType,
      entityId: doc._id,
      entityLabel,
      metaTitle: legacySeo?.metaTitle,
      metaDescription: legacySeo?.metaDescription,
      metaKeywords: legacySeo?.metaKeywords ?? [],
      ogImage: legacySeo?.ogImage,
      canonicalUrl: legacySeo?.canonicalUrl,
    });
    migrated++;
    if (hasAnyValue(legacySeo)) {
      logger.log(`  → carried over existing SEO fields for ${path}`);
    }
  }

  return { migrated, skipped };
}

async function migrateSingleton(
  model: Model<unknown>,
  path: string,
  entityLabel: string,
  seoEntryModel: Model<unknown>,
): Promise<void> {
  const doc = await model.collection.findOne<Record<string, unknown>>({});
  const legacySeo = doc?.seo as LegacySeoMeta | undefined;
  if (!hasAnyValue(legacySeo)) return;

  const existing = await seoEntryModel.findOne({ path });
  if (!existing) return; // ensureStaticPages() should have already created this row

  const hasBeenEdited = hasAnyValue(existing as unknown as LegacySeoMeta);
  if (hasBeenEdited) return; // don't clobber an edit made after this deploy

  await seoEntryModel.updateOne(
    { path },
    {
      $set: {
        metaTitle: legacySeo?.metaTitle,
        metaDescription: legacySeo?.metaDescription,
        metaKeywords: legacySeo?.metaKeywords ?? [],
        ogImage: legacySeo?.ogImage,
        canonicalUrl: legacySeo?.canonicalUrl,
        entityLabel,
      },
    },
  );
  logger.log(`  → carried over existing SEO fields for ${path}`);
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const productModel = app.get<Model<unknown>>(getModelToken(Product.name));
    const blogModel = app.get<Model<unknown>>(getModelToken(Blog.name));
    const categoryModel = app.get<Model<unknown>>(getModelToken(Category.name));
    const projectModel = app.get<Model<unknown>>(getModelToken(Project.name));
    const aboutModel = app.get<Model<unknown>>(getModelToken(AboutPage.name));
    const settingsModel = app.get<Model<unknown>>(
      getModelToken(WebsiteSettings.name),
    );
    const seoEntryModel = app.get<Model<unknown>>(getModelToken(SeoEntry.name));

    logger.log('Migrating products…');
    const products = await migrateCollection(
      productModel,
      SeoPageType.PRODUCT,
      (doc) => (doc.slug ? `/products/${doc.slug as string}` : undefined),
      'name',
      seoEntryModel,
    );
    logger.log(
      `  products: ${products.migrated} migrated, ${products.skipped} skipped`,
    );

    logger.log('Migrating blogs…');
    const blogs = await migrateCollection(
      blogModel,
      SeoPageType.BLOG,
      (doc) => (doc.slug ? `/blogs/${doc.slug as string}` : undefined),
      'title',
      seoEntryModel,
    );
    logger.log(`  blogs: ${blogs.migrated} migrated, ${blogs.skipped} skipped`);

    logger.log('Migrating categories…');
    const categories = await migrateCollection(
      categoryModel,
      SeoPageType.CATEGORY,
      (doc) => (doc.slug ? `/categories/${doc.slug as string}` : undefined),
      'name',
      seoEntryModel,
    );
    logger.log(
      `  categories: ${categories.migrated} migrated, ${categories.skipped} skipped`,
    );

    logger.log('Migrating projects…');
    const projects = await migrateCollection(
      projectModel,
      SeoPageType.PROJECT,
      (doc) => (doc.slug ? `/projects/${doc.slug as string}` : undefined),
      'title',
      seoEntryModel,
    );
    logger.log(
      `  projects: ${projects.migrated} migrated, ${projects.skipped} skipped`,
    );

    logger.log('Migrating About page singleton…');
    await migrateSingleton(aboutModel, '/about', 'About', seoEntryModel);

    logger.log('Migrating Website Settings (home) singleton…');
    await migrateSingleton(settingsModel, '/', 'Home', seoEntryModel);

    logger.log(
      'Done. Review the SEO section in the CMS to confirm everything landed as expected.',
    );
  } finally {
    await app.close();
  }
}

bootstrap().catch((error) => {
  logger.error('Migration failed', error);
  process.exit(1);
});
