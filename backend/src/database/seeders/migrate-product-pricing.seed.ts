/**
 * One-off migration — run once, right after deploying the pricing/filters
 * phase, BEFORE any CMS editor opens and re-saves an existing product.
 * NOT wired into `onApplicationBootstrap` (same reasoning as
 * `demo-data.seed.ts`/`migrate-seo.seed.ts`): this touches every existing
 * Product document exactly once and has nothing useful to do on a second
 * run against already-migrated data.
 *
 * Why this is needed at all: `price` was added to `ProductSchema` as a
 * `required` field. Mongoose only enforces `required` at validate/save
 * time, not on reads — so existing products missing `price` will still
 * be returned fine by every GET endpoint. But the moment anyone (a CMS
 * editor, `ProductsService.update()`) calls `.save()` on one of those
 * documents without also supplying a price, that save fails with a
 * ValidationError. And until migrated, those products are invisible to
 * price-range filtering/sorting (`effectivePrice` doesn't exist on them,
 * so `$gte`/`$lte` queries against it never match) and show no price row
 * on the storefront.
 *
 * Why raw `.collection` instead of the typed Mongoose model: going
 * through `Model.updateOne()` would run the schema's own validators
 * against a `$set` that doesn't necessarily include every required field
 * in one shot, and this only needs to touch documents that predate this
 * phase — the native driver sidesteps that entirely and is exactly the
 * precedent `migrate-seo.seed.ts` set for this kind of backfill.
 *
 * The fallback price is deliberately loud rather than a silent 0 (an
 * un-set price with a currency symbol reading "₹0" looks broken, not
 * "TBD"): every migrated product also gets `needsPriceReview: true` so
 * the CMS can be filtered to find them, and this script logs each one's
 * name/slug so whoever runs it has a checklist. Set MIGRATION_DEFAULT_PRICE
 * to whatever placeholder makes sense for your catalog before running —
 * it defaults to 9999 (₹) if unset.
 *
 * Idempotent: the query only ever matches `{ price: { $exists: false } }`,
 * so re-running after some/all products have been migrated (or after an
 * editor has since set a real price and the flag was cleared) is
 * harmless — it just finds fewer documents each time.
 */
import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';

import { AppModule } from '../../app.module';
import { Product } from '@modules/products/schemas/product.schema';

const logger = new Logger('MigrateProductPricing');

const DEFAULT_PRICE = Number(process.env.MIGRATION_DEFAULT_PRICE) || 9999;

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const productModel = app.get<Model<unknown>>(getModelToken(Product.name));

    const docs = await productModel.collection
      .find<{ _id: ObjectId; name: string; slug: string }>(
        { price: { $exists: false } },
        { projection: { name: 1, slug: 1 } },
      )
      .toArray();

    if (docs.length === 0) {
      logger.log('No products missing a price — nothing to migrate.');
      return;
    }

    logger.log(
      `Backfilling ${docs.length} product(s) with placeholder price ₹${DEFAULT_PRICE} (flagged needsPriceReview: true)…`,
    );

    for (const doc of docs) {
      await productModel.collection.updateOne(
        { _id: doc._id },
        {
          $set: {
            price: DEFAULT_PRICE,
            effectivePrice: DEFAULT_PRICE,
            stockStatus: 'made_to_order',
            viewCount: 0,
            purchaseCount: 0,
            needsPriceReview: true,
          },
        },
      );
      logger.log(`  → ${doc.name} (/products/${doc.slug})`);
    }

    logger.log(
      `Done. ${docs.length} product(s) now have a placeholder price — ` +
        'open each in the CMS and set its real price (this also clears ' +
        'needsPriceReview once you save it with a real value).',
    );
  } finally {
    await app.close();
  }
}

bootstrap().catch((error) => {
  logger.error('Migration failed', error);
  process.exit(1);
});
