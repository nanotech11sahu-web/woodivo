"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolsModule = void 0;
const common_1 = require("@nestjs/common");
const blogs_module_1 = require("../blogs/blogs.module");
const media_module_1 = require("../media/media.module");
const seo_entries_module_1 = require("../seo-entries/seo-entries.module");
const tools_admin_controller_1 = require("./tools.admin.controller");
const image_generator_service_1 = require("./image-generator.service");
const draft_blog_uploader_service_1 = require("./draft-blog-uploader.service");
let ToolsModule = class ToolsModule {
};
exports.ToolsModule = ToolsModule;
exports.ToolsModule = ToolsModule = __decorate([
    (0, common_1.Module)({
        imports: [blogs_module_1.BlogsModule, media_module_1.MediaModule, seo_entries_module_1.SeoEntriesModule],
        controllers: [tools_admin_controller_1.ToolsAdminController],
        providers: [image_generator_service_1.ImageGeneratorService, draft_blog_uploader_service_1.DraftBlogUploaderService],
    })
], ToolsModule);
//# sourceMappingURL=tools.module.js.map