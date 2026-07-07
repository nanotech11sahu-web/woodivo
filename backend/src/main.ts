import { Logger, RequestMethod, ValidationPipe } from '@nestjs/common';
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

  // Crawlers expect these two at the root of whatever origin serves them,
  // not under /api/v1 — excluded here rather than moved off API_PREFIX
  // entirely. NOTE: this only puts them at the API's own root
  // (http://api-host/sitemap.xml). If the public frontend is a separately
  // hosted static SPA on a different origin, add a reverse-proxy rewrite
  // there (e.g. nginx/Vercel rule for /sitemap.xml and /robots.txt ->
  // this API) so they resolve at the frontend's root too.
  app.setGlobalPrefix(API_PREFIX, {
    exclude: [
      { path: 'sitemap.xml', method: RequestMethod.GET },
      { path: 'robots.txt', method: RequestMethod.GET },
    ],
  });

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
