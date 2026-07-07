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
exports.ProjectSchema = exports.Project = exports.ProjectStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const media_asset_schema_1 = require("../../../common/schemas/media-asset.schema");
const slugify_1 = require("../../../common/utils/slugify");
const category_schema_1 = require("../../categories/schemas/category.schema");
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus["ACTIVE"] = "active";
    ProjectStatus["INACTIVE"] = "inactive";
})(ProjectStatus || (exports.ProjectStatus = ProjectStatus = {}));
let Project = class Project {
    title;
    slug;
    description;
    clientName;
    location;
    completionYear;
    category;
    coverImage;
    images;
    isFeatured;
    displayOrder;
    status;
    createdAt;
    updatedAt;
};
exports.Project = Project;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, maxlength: 150 }),
    __metadata("design:type", String)
], Project.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true,
    }),
    __metadata("design:type", String)
], Project.prototype, "slug", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], Project.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, maxlength: 100 }),
    __metadata("design:type", String)
], Project.prototype, "clientName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, maxlength: 100 }),
    __metadata("design:type", String)
], Project.prototype, "location", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, maxlength: 50 }),
    __metadata("design:type", String)
], Project.prototype, "completionYear", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: category_schema_1.Category.name, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Project.prototype, "category", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: media_asset_schema_1.MediaAssetSchema }),
    __metadata("design:type", media_asset_schema_1.MediaAsset)
], Project.prototype, "coverImage", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [media_asset_schema_1.MediaAssetSchema], default: [] }),
    __metadata("design:type", Array)
], Project.prototype, "images", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Project.prototype, "isFeatured", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Project.prototype, "displayOrder", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ProjectStatus,
        default: ProjectStatus.ACTIVE,
        index: true,
    }),
    __metadata("design:type", String)
], Project.prototype, "status", void 0);
exports.Project = Project = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Project);
exports.ProjectSchema = mongoose_1.SchemaFactory.createForClass(Project);
exports.ProjectSchema.index({ displayOrder: 1 });
exports.ProjectSchema.index({ title: 'text', description: 'text' });
exports.ProjectSchema.pre('save', function () {
    if (this.isModified('title') && !this.slug) {
        this.slug = (0, slugify_1.slugify)(this.title);
    }
    else if (this.isModified('slug') && this.slug) {
        this.slug = (0, slugify_1.slugify)(this.slug);
    }
});
//# sourceMappingURL=project.schema.js.map