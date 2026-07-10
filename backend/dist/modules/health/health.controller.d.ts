import type { Connection } from 'mongoose';
interface HealthStatus {
    status: 'ok' | 'degraded';
    uptime: number;
    database: 'connected' | 'disconnected' | 'connecting' | 'disconnecting';
    timestamp: string;
}
export declare class HealthController {
    private readonly connection;
    constructor(connection: Connection);
    check(): HealthStatus;
}
export {};
