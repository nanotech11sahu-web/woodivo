/**
 * Subcategory seeder — NOT wired into `onApplicationBootstrap`, same
 * reasoning as `demo-data.seed.ts`: opt-in only (`npm run seed:subcategories`).
 *
 * Unlike `demo-data.seed.ts`, this does NOT hardcode category names —
 * local and prod have different category data (different names, counts,
 * order), so a hardcoded `byName('Dining Tables')`-style lookup would
 * silently no-op or throw depending on which database it's run against.
 * Instead this reads whatever categories actually exist in the target
 * database at runtime and seeds subcategories under every one of them.
 *
 * Subcategory names are deliberately generic ("Standard", "Premium",
 * "Custom Made", "General") rather than furniture-specific ("Chairs",
 * "Tables") for the same reason — this has to make sense under ANY
 * category, whatever it's actually called in that environment. Treat
 * these as real starter data, not throwaway placeholders — rename or
 * add to them in the CMS once real subcategory names are decided.
 *
 * Distribution: the first category seeded gets 3 subcategories; after
 * that it alternates 1, 3, 1, 3, … across the remaining categories in
 * `displayOrder` — so every category ends up with at least one, and
 * about half get the fuller 3-subcategory set.
 *
 * Idempotent per-category: a category that already has any subcategories
 * (from a previous run, or real ones an editor already added) is left
 * alone entirely — this only fills in categories with zero subcategories.
 *
 * Slugs are set explicitly via `slugify()`, not left to each schema's own
 * `pre('save')` hook — same reasoning as `demo-data.seed.ts` (validation
 * runs before `pre('save')`, so a hook can't satisfy a `required` slug
 * field in time on a brand-new document).
 */
import { slugify } from '@common/utils/slugify';
import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Logger } from '@nestjs/common';
import { Model, Types } from 'mongoose';

import { AppModule } from '../../app.module';
import { Category } from '@modules/categories/schemas/category.schema';
import {
  SubCategory,
  SubCategoryStatus,
} from '@modules/subcategories/schemas/subcategory.schema';

const logger = new Logger('SeedSubCategories');

// Generic, category-agnostic starter names — safe under any category.
const THREE_PACK = [
  {
    name: 'Standard',
    description: 'Everyday pieces at our regular pricing and finish options.',
  },
  {
    name: 'Premium',
    description: 'Upgraded materials and finishes for a higher-end look.',
  },
  {
    name: 'Custom Made',
    description: 'Built to your exact measurements and specifications.',
  },
];

const ONE_PACK = [
  {
    name: 'General',
    description: 'The full range within this category.',
  },
];

async function seedSubCategories(
  categoryModel: Model<Category>,
  subCategoryModel: Model<SubCategory>,
) {
  const categories = await categoryModel
    .find()
    .sort({ displayOrder: 1 })
    .lean();

  if (categories.length === 0) {
    logger.log('No categories found — nothing to seed. Run seed:demo or create categories first.');
    return;
  }

  let seededCategories = 0;
  let seededSubCategories = 0;
  let skipped = 0;

  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];

    const existingCount = await subCategoryModel.countDocuments({
      category: category._id,
    });
    if (existingCount > 0) {
      logger.log(
        `  – ${category.name}: already has ${existingCount} subcategor${existingCount === 1 ? 'y' : 'ies'} — skipping.`,
      );
      skipped++;
      continue;
    }

    // First category gets 3, then alternates 1, 3, 1, 3, … after that.
    const useThreePack = i === 0 || i % 2 === 0;
    const defs = useThreePack ? THREE_PACK : ONE_PACK;

    const created = await subCategoryModel.create(
      defs.map((d, order) => ({
        category: category._id as Types.ObjectId,
        name: d.name,
        slug: slugify(`${category.name}-${d.name}`),
        description: d.description,
        displayOrder: order,
        status: SubCategoryStatus.ACTIVE,
        isFeatured: order === 0,
      })),
    );

    logger.log(
      `  ✓ ${category.name}: seeded ${created.length} subcategor${created.length === 1 ? 'y' : 'ies'} (${defs.map((d) => d.name).join(', ')})`,
    );
    seededCategories++;
    seededSubCategories += created.length;
  }

  logger.log(
    `Done. ${seededCategories} categor${seededCategories === 1 ? 'y' : 'ies'} seeded ` +
      `(${seededSubCategories} subcategories total), ${skipped} skipped (already had some).`,
  );
}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['warn', 'error'],
  });

  try {
    const categoryModel = app.get<Model<Category>>(
      getModelToken(Category.name),
    );
    const subCategoryModel = app.get<Model<SubCategory>>(
      getModelToken(SubCategory.name),
    );

    await seedSubCategories(categoryModel, subCategoryModel);
  } finally {
    await app.close();
  }
}

bootstrap().catch((error: unknown) => {
  logger.error(
    'Subcategory seed failed',
    error instanceof Error ? error.stack : error,
  );
  process.exitCode = 1;
});
