/**
 * One-off migration — run once, right after deploying the subcategory
 * filters phase, to backfill `subCategory` on products that predate it.
 * NOT wired into `onApplicationBootstrap` (same reasoning as
 * `demo-data.seed.ts`/`migrate-seo.seed.ts`/`migrate-product-pricing.seed.ts`):
 * this touches every existing Product document at most once and has
 * nothing useful to do on a second run against already-migrated data.
 *
 * Why this is needed at all: `subCategory` is (and remains) legitimately
 * optional on `Product` — a product can belong to a category with no
 * subcategory. But subcategory-based filtering only surfaces products
 * that actually have one set, so any pre-existing product with no
 * `subCategory` is invisible to that filter until someone assigns it.
 *
 * Matching rule (best-effort, never guesses): for each product missing
 * `subCategory`, look only at the subcategories under that product's own
 * `category`, and check whether a subcategory's name — or its naive
 * singular form (trailing "es"/"s" stripped) — appears as a
 * case-insensitive substring of the product's name.
 *   - Exactly one subcategory matches  → auto-assign it.
 *   - Zero or multiple subcategories match → leave `subCategory` unset
 *     and set `needsSubCategoryReview: true` so the CMS can be filtered
 *     to find it and someone picks the right one by hand. This script
 *     deliberately does not guess in ambiguous cases — a wrong
 *     auto-assignment is worse than an honest "unassigned" flag.
 *
 * Why raw `.collection` instead of the typed Mongoose model: same
 * precedent as `migrate-product-pricing.seed.ts` — this only needs to
 * touch documents that predate this phase, and going through
 * `Model.updateOne()` would run schema validators against a partial
 * `$set` for no benefit here.
 *
 * Idempotent: the query only ever matches products with no `subCategory`
 * set. A product that got auto-assigned or flagged on a previous run is
 * skipped on the next one; a product an editor has since assigned by
 * hand is skipped too, since `subCategory` is now set.
 */
import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';

import { AppModule } from '../../app.module';
import { Product } from '@modules/products/schemas/product.schema';
import { SubCategory } from '@modules/subcategories/schemas/subcategory.schema';

const logger = new Logger('MigrateSubCategory');

interface ProductDoc {
  _id: ObjectId;
  name: string;
  slug: string;
  category: ObjectId;
}

interface SubCategoryDoc {
  _id: ObjectId;
  name: string;
  category: ObjectId;
}

// Naive singularizer — good enough for catalog words like "Chairs" →
// "Chair", "Benches" → "Bench". Not meant to be linguistically complete,
// just enough to catch the common plural-subcategory / singular-product
// -name mismatch without a dictionary dependency.
function singularize(word: string): string {
  if (word.endsWith('ies')) return word.slice(0, -3) + 'y';
  if (word.endsWith('es')) return word.slice(0, -2);
  if (word.endsWith('s')) return word.slice(0, -1);
  return word;
}

function findMatches(
  productName: string,
  candidates: SubCategoryDoc[],
): SubCategoryDoc[] {
  const haystack = productName.toLowerCase();
  return candidates.filter((sc) => {
    const name = sc.name.toLowerCase();
    return haystack.includes(name) || haystack.includes(singularize(name));
  });
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const productModel = app.get<Model<unknown>>(getModelToken(Product.name));
    const subCategoryModel = app.get<Model<unknown>>(
      getModelToken(SubCategory.name),
    );

    const products = await productModel.collection
      .find<ProductDoc>(
        { subCategory: { $exists: false } },
        { projection: { name: 1, slug: 1, category: 1 } },
      )
      .toArray();

    if (products.length === 0) {
      logger.log('No products missing a subCategory — nothing to migrate.');
      return;
    }

    const allSubCategories = await subCategoryModel.collection
      .find<SubCategoryDoc>({}, { projection: { name: 1, category: 1 } })
      .toArray();

    const subCategoriesByCategory = new Map<string, SubCategoryDoc[]>();
    for (const sc of allSubCategories) {
      const key = sc.category.toString();
      const list = subCategoriesByCategory.get(key) ?? [];
      list.push(sc);
      subCategoriesByCategory.set(key, list);
    }

    logger.log(
      `Checking ${products.length} product(s) missing a subCategory against name-matching rules…`,
    );

    let assigned = 0;
    let flagged = 0;

    for (const product of products) {
      const candidates =
        subCategoriesByCategory.get(product.category.toString()) ?? [];
      const matches = findMatches(product.name, candidates);

      if (matches.length === 1) {
        await productModel.collection.updateOne(
          { _id: product._id },
          { $set: { subCategory: matches[0]._id } },
        );
        logger.log(
          `  ✓ ${product.name} (/products/${product.slug}) → ${matches[0].name}`,
        );
        assigned++;
      } else {
        await productModel.collection.updateOne(
          { _id: product._id },
          { $set: { needsSubCategoryReview: true } },
        );
        const reason =
          matches.length === 0
            ? 'no subcategory name matched'
            : `ambiguous — matched ${matches.map((m) => m.name).join(', ')}`;
        logger.log(
          `  ⚑ ${product.name} (/products/${product.slug}) — ${reason}, flagged for manual review`,
        );
        flagged++;
      }
    }

    logger.log(
      `Done. ${assigned} product(s) auto-assigned, ${flagged} flagged with ` +
        'needsSubCategoryReview for manual assignment in the CMS.',
    );
  } finally {
    await app.close();
  }
}

bootstrap().catch((error) => {
  logger.error('Migration failed', error);
  process.exit(1);
});
