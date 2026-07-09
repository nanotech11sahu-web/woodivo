import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';
import { API_PREFIX } from '@common/constants/app.constants';
import type { AppConfig } from '@config/configuration';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);
  const appConfig = configService.get<AppConfig>('app');

  // NOTE: sitemap.xml/robots.txt used to be excluded here and served by
  // this API directly. They're now generated as static files on the
  // frontend (frontend/scripts/generate-sitemap.mjs) from the
  // /seo/sitemap-data endpoint below, so no prefix exclusion is needed —
  // that endpoint lives under the normal API_PREFIX like everything else.
  app.setGlobalPrefix(API_PREFIX);

  app.use(helmet());
  app.use(compression());

  app.enableCors({
    origin: appConfig?.corsOrigins?.length ? appConfig.corsOrigins : true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.enableShutdownHooks();

  const port = appConfig?.port ?? 4000;
  await app.listen(port);

  Logger.log(
    `🚀 WOODIVO API running on http://localhost:${port}/${API_PREFIX}`,
    'Bootstrap',
  );
}

void bootstrap();
