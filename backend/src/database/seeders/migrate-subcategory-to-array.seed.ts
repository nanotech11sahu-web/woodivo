/**
 * One-off migration — run once, right after deploying the multi-subcategory
 * support (Product.subCategory -> Product.subCategories[]), to convert any
 * pre-existing single `subCategory` value into the new array field.
 *
 * NOT wired into `onApplicationBootstrap`, same reasoning as
 * `migrate-subcategory.seed.ts`: this touches every existing Product
 * document at most once and has nothing useful to do on a second run
 * against already-migrated data.
 *
 * Uses raw `.collection` instead of the typed Mongoose model, same
 * precedent as `migrate-subcategory.seed.ts` — this only needs to touch
 * documents that predate this phase.
 *
 * Idempotent: only matches documents that still have the legacy
 * `subCategory` field. A product already migrated (or created fresh after
 * this deploy, which never gets a `subCategory` field at all) is skipped.
 */
import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Logger } from '@nestjs/common';
import { Model } from 'mongoose';

import { AppModule } from '../../app.module';
import { Product } from '@modules/products/schemas/product.schema';

const logger = new Logger('MigrateSubCategoryToArray');

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const productModel = app.get<Model<unknown>>(getModelToken(Product.name));

    const products = await productModel.collection
      .find(
        { subCategory: { $exists: true } },
        { projection: { subCategory: 1 } },
      )
      .toArray();

    if (products.length === 0) {
      logger.log('No products with a legacy subCategory field — nothing to migrate.');
      return;
    }

    logger.log(`Converting ${products.length} product(s) from subCategory -> subCategories...`);

    for (const product of products) {
      await productModel.collection.updateOne(
        { _id: product._id },
        {
          $set: { subCategories: [product.subCategory] },
          $unset: { subCategory: '' },
        },
      );
    }

    logger.log(`Done. ${products.length} product(s) converted.`);
  } finally {
    await app.close();
  }
}

bootstrap().catch((error) => {
  logger.error('Migration failed', error);
  process.exit(1);
});
