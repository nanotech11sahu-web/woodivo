export interface AppConfig {
  nodeEnv: string;
  port: number;
  corsOrigins: string[];
  publicSiteUrl: string;
}

export interface DatabaseConfig {
  uri: string;
}

export interface JwtConfig {
  secret: string;
  expiresIn: string;
  refreshSecret: string;
  refreshExpiresIn: string;
}

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

export interface MailConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  adminNotificationEmail: string;
}

export interface ThrottleConfig {
  ttl: number;
  limit: number;
}

export default () => ({
  app: {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: parseInt(process.env.PORT ?? '4000', 10),
    corsOrigins: (process.env.CORS_ORIGINS ?? '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    // Absolute origin of the public frontend, no trailing slash — used to
    // build absolute <loc>/Sitemap: URLs for sitemap.xml and robots.txt,
    // which are generated with no request context to derive an origin from.
    publicSiteUrl: (process.env.PUBLIC_SITE_URL ?? '').replace(/\/+$/, ''),
  } satisfies AppConfig,

  database: {
    uri: process.env.MONGODB_URI ?? '',
  } satisfies DatabaseConfig,

  jwt: {
    secret: process.env.JWT_SECRET ?? '',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? '',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '30d',
  } satisfies JwtConfig,

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? '',
    apiKey: process.env.CLOUDINARY_API_KEY ?? '',
    apiSecret: process.env.CLOUDINARY_API_SECRET ?? '',
  } satisfies CloudinaryConfig,

  mail: {
    host: process.env.SMTP_HOST ?? '',
    port: parseInt(process.env.SMTP_PORT ?? '587', 10),
    user: process.env.SMTP_USER ?? '',
    pass: process.env.SMTP_PASS ?? '',
    from: process.env.MAIL_FROM ?? '',
    adminNotificationEmail: process.env.ADMIN_NOTIFICATION_EMAIL ?? '',
  } satisfies MailConfig,

  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL ?? '60', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT ?? '100', 10),
  } satisfies ThrottleConfig,
});
