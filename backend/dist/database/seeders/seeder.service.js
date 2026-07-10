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
var SeederService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeederService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const users_service_1 = require("../../modules/users/users.service");
const seo_entries_service_1 = require("../../modules/seo-entries/seo-entries.service");
let SeederService = SeederService_1 = class SeederService {
    usersService;
    configService;
    seoEntriesService;
    logger = new common_1.Logger(SeederService_1.name);
    constructor(usersService, configService, seoEntriesService) {
        this.usersService = usersService;
        this.configService = configService;
        this.seoEntriesService = seoEntriesService;
    }
    async onApplicationBootstrap() {
        await this.seedSuperAdmin();
        await this.seedStaticSeoPages();
    }
    async seedStaticSeoPages() {
        await this.seoEntriesService.ensureStaticPages();
        this.logger.log('Static SEO entries ensured (home, about, contact, gallery, projects, blogs)');
    }
    async seedSuperAdmin() {
        const name = this.configService.get('SEED_ADMIN_NAME') ?? 'Super Admin';
        const email = this.configService.get('SEED_ADMIN_EMAIL');
        const password = this.configService.get('SEED_ADMIN_PASSWORD');
        if (!email || !password) {
            this.logger.warn('SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set — skipping super admin seed');
            return;
        }
        await this.usersService.ensureSuperAdminExists(name, email, password);
        this.logger.log(`Super admin ensured: ${email}`);
    }
};
exports.SeederService = SeederService;
exports.SeederService = SeederService = SeederService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        config_1.ConfigService,
        seo_entries_service_1.SeoEntriesService])
], SeederService);
//# sourceMappingURL=seeder.service.js.map