import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

import configuration from '@config/configuration';
import { envValidationSchema } from '@config/env.validation';
import { DatabaseModule } from '@database/database.module';

import { AllExceptionsFilter } from '@common/filters/all-exceptions.filter';
import { TransformInterceptor } from '@common/interceptors/transform.interceptor';
import { LoggingInterceptor } from '@common/interceptors/logging.interceptor';

import { HealthModule } from '@modules/health/health.module';
import { MediaModule } from '@modules/media/media.module';
import { MailModule } from '@modules/mail/mail.module';
import { AuthModule } from '@modules/auth/auth.module';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { UsersModule } from '@modules/users/users.module';
import { CategoriesModule } from '@modules/categories/categories.module';
import { ProductsModule } from '@modules/products/products.module';
import { EnquiriesModule } from '@modules/enquiries/enquiries.module';
import { BlogsModule } from '@modules/blogs/blogs.module';
import { GalleryModule } from '@modules/gallery/gallery.module';
import { TestimonialsModule } from '@modules/testimonials/testimonials.module';
import { FaqsModule } from '@modules/faqs/faqs.module';
import { BannersModule } from '@modules/banners/banners.module';
import { SettingsModule } from '@modules/settings/settings.module';
import { AboutModule } from '@modules/about/about.module';
import { SeoModule } from '@modules/seo/seo.module';
import { SeoEntriesModule } from '@modules/seo-entries/seo-entries.module';
import { SeederModule } from '@database/seeders/seeder.module';
import { ToolsModule } from '@modules/tools/tools.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: envValidationSchema,
      validationOptions: { abortEarly: false },
    }),

    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => ({
        throttlers: [
          {
            ttl: parseInt(process.env.THROTTLE_TTL ?? '60', 10) * 1000,
            limit: parseInt(process.env.THROTTLE_LIMIT ?? '100', 10),
          },
        ],
      }),
    }),

    DatabaseModule,

    // Shared infrastructure
    MediaModule,
    MailModule,

    // Auth (must be before feature modules that depend on guards)
    AuthModule,
    UsersModule,

    // Feature modules
    HealthModule,
    CategoriesModule,
    ProductsModule,
    EnquiriesModule,
    BlogsModule,
    GalleryModule,
    TestimonialsModule,
    FaqsModule,
    BannersModule,
    SettingsModule,
    AboutModule,
    SeoModule,
    SeoEntriesModule,
    SeederModule,
    ToolsModule,
  ],
  providers: [
    // Rate limiting
    { provide: APP_GUARD, useClass: ThrottlerGuard },

    // Auth guards applied globally — routes opt-out via @Public()
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },

    // Exception handling and response shaping
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
  ],
})
export class AppModule {}
