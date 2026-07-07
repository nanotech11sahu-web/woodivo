"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => ({
    app: {
        nodeEnv: process.env.NODE_ENV ?? 'development',
        port: parseInt(process.env.PORT ?? '4000', 10),
        corsOrigins: (process.env.CORS_ORIGINS ?? '')
            .split(',')
            .map((origin) => origin.trim())
            .filter(Boolean),
        publicSiteUrl: (process.env.PUBLIC_SITE_URL ?? '').replace(/\/+$/, ''),
    },
    database: {
        uri: process.env.MONGODB_URI ?? '',
    },
    jwt: {
        secret: process.env.JWT_SECRET ?? '',
        expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
        refreshSecret: process.env.JWT_REFRESH_SECRET ?? '',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '30d',
    },
    cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? '',
        apiKey: process.env.CLOUDINARY_API_KEY ?? '',
        apiSecret: process.env.CLOUDINARY_API_SECRET ?? '',
    },
    mail: {
        host: process.env.SMTP_HOST ?? '',
        port: parseInt(process.env.SMTP_PORT ?? '587', 10),
        user: process.env.SMTP_USER ?? '',
        pass: process.env.SMTP_PASS ?? '',
        from: process.env.MAIL_FROM ?? '',
        adminNotificationEmail: process.env.ADMIN_NOTIFICATION_EMAIL ?? '',
    },
    throttle: {
        ttl: parseInt(process.env.THROTTLE_TTL ?? '60', 10),
        limit: parseInt(process.env.THROTTLE_LIMIT ?? '100', 10),
    },
});
//# sourceMappingURL=configuration.js.map