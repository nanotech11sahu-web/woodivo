import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import type { DatabaseConfig } from '@config/configuration';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get<DatabaseConfig>('database');
        return {
          uri: dbConfig?.uri,
          autoIndex: true,
        };
      },
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
