import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { API_PREFIX } from '../src/common/constants/app.constants';

describe('HealthController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix(API_PREFIX);
    await app.init();
  });

  it(`/${API_PREFIX}/health (GET)`, () => {
    return request(app.getHttpServer())
      .get(`/${API_PREFIX}/health`)
      .expect(200);
  });

  afterEach(async () => {
    await app.close();
  });
});
