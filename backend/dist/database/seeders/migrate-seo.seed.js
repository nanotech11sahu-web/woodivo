"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const mongoose_1 = require("@nestjs/mongoose");
const common_1 = require("@nestjs/common");
const app_module_1 = require("../../app.module");
const product_schema_1 = require("../../modules/products/schemas/product.schema");
const blog_schema_1 = require("../../modules/blogs/schemas/blog.schema");
const category_schema_1 = require("../../modules/categories/schemas/category.schema");
const project_schema_1 = require("../../modules/projects/schemas/project.schema");
const about_page_schema_1 = require("../../modules/about/schemas/about-page.schema");
const website_settings_schema_1 = require("../../modules/settings/schemas/website-settings.schema");
const seo_entry_schema_1 = require("../../modules/seo-entries/schemas/seo-entry.schema");
const logger = new common_1.Logger('MigrateSeo');
function hasAnyValue(seo) {
    if (!seo)
        return false;
    return Boolean(seo.metaTitle ||
        seo.metaDescription ||
        seo.canonicalUrl ||
        seo.ogImage ||
        (seo.metaKeywords && seo.metaKeywords.length > 0));
}
async function migrateCollection(model, pageType, buildPath, labelField, seoEntryModel) {
    const docs = await model.collection
        .find({})
        .toArray();
    let migrated = 0;
    let skipped = 0;
    for (const doc of docs) {
        const legacySeo = doc.seo;
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
async function migrateSingleton(model, path, entityLabel, seoEntryModel) {
    const doc = await model.collection.findOne({});
    const legacySeo = doc?.seo;
    if (!hasAnyValue(legacySeo))
        return;
    const existing = await seoEntryModel.findOne({ path });
    if (!existing)
        return;
    const hasBeenEdited = hasAnyValue(existing);
    if (hasBeenEdited)
        return;
    await seoEntryModel.updateOne({ path }, {
        $set: {
            metaTitle: legacySeo?.metaTitle,
            metaDescription: legacySeo?.metaDescription,
            metaKeywords: legacySeo?.metaKeywords ?? [],
            ogImage: legacySeo?.ogImage,
            canonicalUrl: legacySeo?.canonicalUrl,
            entityLabel,
        },
    });
    logger.log(`  → carried over existing SEO fields for ${path}`);
}
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule, {
        logger: ['error', 'warn'],
    });
    try {
        const productModel = app.get((0, mongoose_1.getModelToken)(product_schema_1.Product.name));
        const blogModel = app.get((0, mongoose_1.getModelToken)(blog_schema_1.Blog.name));
        const categoryModel = app.get((0, mongoose_1.getModelToken)(category_schema_1.Category.name));
        const projectModel = app.get((0, mongoose_1.getModelToken)(project_schema_1.Project.name));
        const aboutModel = app.get((0, mongoose_1.getModelToken)(about_page_schema_1.AboutPage.name));
        const settingsModel = app.get((0, mongoose_1.getModelToken)(website_settings_schema_1.WebsiteSettings.name));
        const seoEntryModel = app.get((0, mongoose_1.getModelToken)(seo_entry_schema_1.SeoEntry.name));
        logger.log('Migrating products…');
        const products = await migrateCollection(productModel, seo_entry_schema_1.SeoPageType.PRODUCT, (doc) => (doc.slug ? `/products/${doc.slug}` : undefined), 'name', seoEntryModel);
        logger.log(`  products: ${products.migrated} migrated, ${products.skipped} skipped`);
        logger.log('Migrating blogs…');
        const blogs = await migrateCollection(blogModel, seo_entry_schema_1.SeoPageType.BLOG, (doc) => (doc.slug ? `/blogs/${doc.slug}` : undefined), 'title', seoEntryModel);
        logger.log(`  blogs: ${blogs.migrated} migrated, ${blogs.skipped} skipped`);
        logger.log('Migrating categories…');
        const categories = await migrateCollection(categoryModel, seo_entry_schema_1.SeoPageType.CATEGORY, (doc) => (doc.slug ? `/categories/${doc.slug}` : undefined), 'name', seoEntryModel);
        logger.log(`  categories: ${categories.migrated} migrated, ${categories.skipped} skipped`);
        logger.log('Migrating projects…');
        const projects = await migrateCollection(projectModel, seo_entry_schema_1.SeoPageType.PROJECT, (doc) => (doc.slug ? `/projects/${doc.slug}` : undefined), 'title', seoEntryModel);
        logger.log(`  projects: ${projects.migrated} migrated, ${projects.skipped} skipped`);
        logger.log('Migrating About page singleton…');
        await migrateSingleton(aboutModel, '/about', 'About', seoEntryModel);
        logger.log('Migrating Website Settings (home) singleton…');
        await migrateSingleton(settingsModel, '/', 'Home', seoEntryModel);
        logger.log('Done. Review the SEO section in the CMS to confirm everything landed as expected.');
    }
    finally {
        await app.close();
    }
}
bootstrap().catch((error) => {
    logger.error('Migration failed', error);
    process.exit(1);
});
//# sourceMappingURL=migrate-seo.seed.js.map