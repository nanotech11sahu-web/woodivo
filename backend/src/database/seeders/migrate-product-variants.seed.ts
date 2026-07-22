/**
 * One-off migration — run once, right after deploying the `variants`
 * field on `ProductSchema` (see modules/products/schemas/product.schema.ts
 * for why it exists: some products are sold in multiple size/finish
 * options at different prices, which the single top-level
 * price/discountPrice/sku never could represent).
 *
 * NOT wired into `onApplicationBootstrap`, same reasoning as every other
 * migrate-*.seed.ts here: this touches every existing Product document at
 * most once and has nothing useful to do on a second run against
 * already-migrated data.
 *
 * `variants` is optional with a schema-level `default: []`, so this
 * migration is a convenience/consistency backfill, not a correctness
 * fix like `migrate-product-pricing` was for a newly-`required` field —
 * Mongoose already applies that default on read for any document
 * missing the field. Running this just makes every existing document
 * explicit about having no variants, which keeps
 * `{ variants: { $exists: true } }`-style queries and raw Mongo
 * inspection (e.g. via mongosh) consistent across old and new documents.
 *
 * Uses raw `.collection` instead of the typed Mongoose model, same
 * precedent as `migrate-subcategory.seed.ts` / `migrate-product-pricing`
 * — this only needs to touch documents that predate this field.
 *
 * Idempotent: only matches documents that don't yet have a `variants`
 * field, so re-running after some/all products have been migrated is
 * harmless — it just finds fewer documents each time.
 */
import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Logger } from '@nestjs/common';
import { Model } from 'mongoose';

import { AppModule } from '../../app.module';
import { Product } from '@modules/products/schemas/product.schema';

const logger = new Logger('MigrateProductVariants');

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const productModel = app.get<Model<unknown>>(getModelToken(Product.name));

    const result = await productModel.collection.updateMany(
      { variants: { $exists: false } },
      { $set: { variants: [] } },
    );

    if (result.modifiedCount === 0) {
      logger.log('No products missing `variants` — nothing to migrate.');
      return;
    }

    logger.log(
      `Backfilled \`variants: []\` on ${result.modifiedCount} product(s).`,
    );
  } finally {
    await app.close();
  }
}

bootstrap().catch((error) => {
  logger.error('Migration failed', error);
  process.exit(1);
});
