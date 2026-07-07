"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const throttler_1 = require("@nestjs/throttler");
const configuration_1 = __importDefault(require("./config/configuration"));
const env_validation_1 = require("./config/env.validation");
const database_module_1 = require("./database/database.module");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
const health_module_1 = require("./modules/health/health.module");
const media_module_1 = require("./modules/media/media.module");
const mail_module_1 = require("./modules/mail/mail.module");
const auth_module_1 = require("./modules/auth/auth.module");
const jwt_auth_guard_1 = require("./modules/auth/guards/jwt-auth.guard");
const roles_guard_1 = require("./modules/auth/guards/roles.guard");
const users_module_1 = require("./modules/users/users.module");
const categories_module_1 = require("./modules/categories/categories.module");
const products_module_1 = require("./modules/products/products.module");
const enquiries_module_1 = require("./modules/enquiries/enquiries.module");
const blogs_module_1 = require("./modules/blogs/blogs.module");
const projects_module_1 = require("./modules/projects/projects.module");
const gallery_module_1 = require("./modules/gallery/gallery.module");
const testimonials_module_1 = require("./modules/testimonials/testimonials.module");
const faqs_module_1 = require("./modules/faqs/faqs.module");
const banners_module_1 = require("./modules/banners/banners.module");
const settings_module_1 = require("./modules/settings/settings.module");
const about_module_1 = require("./modules/about/about.module");
const seo_module_1 = require("./modules/seo/seo.module");
const seo_entries_module_1 = require("./modules/seo-entries/seo-entries.module");
const seeder_module_1 = require("./database/seeders/seeder.module");
const tools_module_1 = require("./modules/tools/tools.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [configuration_1.default],
                validationSchema: env_validation_1.envValidationSchema,
                validationOptions: { abortEarly: false },
            }),
            throttler_1.ThrottlerModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: () => ({
                    throttlers: [
                        {
                            ttl: parseInt(process.env.THROTTLE_TTL ?? '60', 10) * 1000,
                            limit: parseInt(process.env.THROTTLE_LIMIT ?? '100', 10),
                        },
                    ],
                }),
            }),
            database_module_1.DatabaseModule,
            media_module_1.MediaModule,
            mail_module_1.MailModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            health_module_1.HealthModule,
            categories_module_1.CategoriesModule,
            products_module_1.ProductsModule,
            enquiries_module_1.EnquiriesModule,
            blogs_module_1.BlogsModule,
            projects_module_1.ProjectsModule,
            gallery_module_1.GalleryModule,
            testimonials_module_1.TestimonialsModule,
            faqs_module_1.FaqsModule,
            banners_module_1.BannersModule,
            settings_module_1.SettingsModule,
            about_module_1.AboutModule,
            seo_module_1.SeoModule,
            seo_entries_module_1.SeoEntriesModule,
            seeder_module_1.SeederModule,
            tools_module_1.ToolsModule,
        ],
        providers: [
            { provide: core_1.APP_GUARD, useClass: throttler_1.ThrottlerGuard },
            { provide: core_1.APP_GUARD, useClass: jwt_auth_guard_1.JwtAuthGuard },
            { provide: core_1.APP_GUARD, useClass: roles_guard_1.RolesGuard },
            { provide: core_1.APP_FILTER, useClass: all_exceptions_filter_1.AllExceptionsFilter },
            { provide: core_1.APP_INTERCEPTOR, useClass: logging_interceptor_1.LoggingInterceptor },
            { provide: core_1.APP_INTERCEPTOR, useClass: transform_interceptor_1.TransformInterceptor },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map