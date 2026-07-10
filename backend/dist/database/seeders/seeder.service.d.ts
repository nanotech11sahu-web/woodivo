import { OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from "../../modules/users/users.service";
import { SeoEntriesService } from "../../modules/seo-entries/seo-entries.service";
export declare class SeederService implements OnApplicationBootstrap {
    private readonly usersService;
    private readonly configService;
    private readonly seoEntriesService;
    private readonly logger;
    constructor(usersService: UsersService, configService: ConfigService, seoEntriesService: SeoEntriesService);
    onApplicationBootstrap(): Promise<void>;
    private seedStaticSeoPages;
    private seedSuperAdmin;
}
