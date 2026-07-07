import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(4000),

  // Database
  MONGODB_URI: Joi.string().required(),

  // Auth
  JWT_SECRET: Joi.string().min(16).required(),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  JWT_REFRESH_SECRET: Joi.string().min(16).required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('30d'),

  // CORS
  CORS_ORIGINS: Joi.string().default('http://localhost:5173'),

  // SEO — absolute origin of the public frontend, used by sitemap.xml
  // and robots.txt to build absolute URLs.
  PUBLIC_SITE_URL: Joi.string().uri().default('http://localhost:5173'),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: Joi.string().required(),
  CLOUDINARY_API_KEY: Joi.string().required(),
  CLOUDINARY_API_SECRET: Joi.string().required(),

  // Mail
  SMTP_HOST: Joi.string().required(),
  SMTP_PORT: Joi.number().default(587),
  SMTP_USER: Joi.string().required(),
  SMTP_PASS: Joi.string().required(),
  MAIL_FROM: Joi.string().email().required(),
  ADMIN_NOTIFICATION_EMAIL: Joi.string().email().required(),

  // Rate limiting
  THROTTLE_TTL: Joi.number().default(60),
  THROTTLE_LIMIT: Joi.number().default(100),
});
