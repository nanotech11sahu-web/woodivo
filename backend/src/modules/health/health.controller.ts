import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';
import { Public } from '@common/decorators/public.decorator';

interface HealthStatus {
  status: 'ok' | 'degraded';
  uptime: number;
  database: 'connected' | 'disconnected' | 'connecting' | 'disconnecting';
  timestamp: string;
}

const CONNECTION_STATES: Record<number, HealthStatus['database']> = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  // Must stay unauthenticated — uptime monitors, Render's own health
  // checks, and load balancers hit this with no credentials.
  @Public()
  @Get()
  check(): HealthStatus {
    const dbState =
      CONNECTION_STATES[this.connection.readyState] ?? 'disconnected';

    return {
      status: dbState === 'connected' ? 'ok' : 'degraded',
      uptime: process.uptime(),
      database: dbState,
      timestamp: new Date().toISOString(),
    };
  }
}
