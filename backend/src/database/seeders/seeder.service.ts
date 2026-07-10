import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '@modules/users/users.service';
import { SeoEntriesService } from '@modules/seo-entries/seo-entries.service';

@Injectable()
export class SeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly seoEntriesService: SeoEntriesService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.seedSuperAdmin();
    await this.seedStaticSeoPages();
  }

  private async seedStaticSeoPages(): Promise<void> {
    await this.seoEntriesService.ensureStaticPages();
    this.logger.log(
      'Static SEO entries ensured (home, about, contact, gallery, blogs)',
    );
  }

  private async seedSuperAdmin(): Promise<void> {
    const name =
      this.configService.get<string>('SEED_ADMIN_NAME') ?? 'Super Admin';
    const email = this.configService.get<string>('SEED_ADMIN_EMAIL');
    const password = this.configService.get<string>('SEED_ADMIN_PASSWORD');

    if (!email || !password) {
      this.logger.warn(
        'SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set — skipping super admin seed',
      );
      return;
    }

    await this.usersService.ensureSuperAdminExists(name, email, password);
    this.logger.log(`Super admin ensured: ${email}`);
  }
}
