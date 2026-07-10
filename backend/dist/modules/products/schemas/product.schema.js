"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductSchema = exports.Product = exports.ProductFaqItemSchema = exports.ProductFaqItem = exports.ProductStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const media_asset_schema_1 = require("../../../common/schemas/media-asset.schema");
const specification_item_schema_1 = require("../../../common/schemas/specification-item.schema");
const slugify_1 = require("../../../common/utils/slugify");
const category_schema_1 = require("../../categories/schemas/category.schema");
const blog_schema_1 = require("../../blogs/schemas/blog.schema");
var ProductStatus;
(function (ProductStatus) {
    ProductStatus["ACTIVE"] = "active";
    ProductStatus["INACTIVE"] = "inactive";
})(ProductStatus || (exports.ProductStatus = ProductStatus = {}));
let ProductFaqItem = class ProductFaqItem {
    question;
    answer;
};
exports.ProductFaqItem = ProductFaqItem;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, maxlength: 300 }),
    __metadata("design:type", String)
], ProductFaqItem.prototype, "question", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], ProductFaqItem.prototype, "answer", void 0);
exports.ProductFaqItem = ProductFaqItem = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], ProductFaqItem);
exports.ProductFaqItemSchema = mongoose_1.SchemaFactory.createForClass(ProductFaqItem);
let Product = class Product {
    category;
    name;
    slug;
    images;
    description;
    specifications;
    isFeatured;
    relatedProducts;
    relatedBlogs;
    faqs;
    displayOrder;
    status;
    createdAt;
    updatedAt;
};
exports.Product = Product;
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Types.ObjectId,
        ref: category_schema_1.Category.name,
        required: true,
        index: true,
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Product.prototype, "category", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, maxlength: 150 }),
    __metadata("design:type", String)
], Product.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true,
    }),
    __metadata("design:type", String)
], Product.prototype, "slug", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [media_asset_schema_1.MediaAssetSchema], default: [] }),
    __metadata("design:type", Array)
], Product.prototype, "images", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], Product.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [specification_item_schema_1.SpecificationItemSchema], default: [] }),
    __metadata("design:type", Array)
], Product.prototype, "specifications", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false, index: true }),
    __metadata("design:type", Boolean)
], Product.prototype, "isFeatured", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: mongoose_2.Types.ObjectId, ref: Product.name }], default: [] }),
    __metadata("design:type", Array)
], Product.prototype, "relatedProducts", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: mongoose_2.Types.ObjectId, ref: blog_schema_1.Blog.name }], default: [] }),
    __metadata("design:type", Array)
], Product.prototype, "relatedBlogs", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exports.ProductFaqItemSchema], default: [] }),
    __metadata("design:type", Array)
], Product.prototype, "faqs", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Product.prototype, "displayOrder", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ProductStatus,
        default: ProductStatus.ACTIVE,
        index: true,
    }),
    __metadata("design:type", String)
], Product.prototype, "status", void 0);
exports.Product = Product = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Product);
exports.ProductSchema = mongoose_1.SchemaFactory.createForClass(Product);
exports.ProductSchema.index({ name: 'text', description: 'text' });
exports.ProductSchema.index({ category: 1, status: 1 });
exports.ProductSchema.pre('save', function () {
    if (this.isModified('name') && !this.slug) {
        this.slug = (0, slugify_1.slugify)(this.name);
    }
    else if (this.isModified('slug') && this.slug) {
        this.slug = (0, slugify_1.slugify)(this.slug);
    }
});
//# sourceMappingURL=product.schema.js.map