"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AboutModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const about_page_schema_1 = require("./schemas/about-page.schema");
const about_service_1 = require("./about.service");
const about_controller_1 = require("./about.controller");
const about_admin_controller_1 = require("./about.admin.controller");
let AboutModule = class AboutModule {
};
exports.AboutModule = AboutModule;
exports.AboutModule = AboutModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: about_page_schema_1.AboutPage.name, schema: about_page_schema_1.AboutPageSchema },
            ]),
        ],
        controllers: [about_controller_1.AboutController, about_admin_controller_1.AboutAdminController],
        providers: [about_service_1.AboutService],
        exports: [mongoose_1.MongooseModule, about_service_1.AboutService],
    })
], AboutModule);
//# sourceMappingURL=about.module.js.map