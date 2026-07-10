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
declare const _default: () => {
    app: {
        nodeEnv: string;
        port: number;
        corsOrigins: string[];
        publicSiteUrl: string;
    };
    database: {
        uri: string;
    };
    jwt: {
        secret: string;
        expiresIn: string;
        refreshSecret: string;
        refreshExpiresIn: string;
    };
    cloudinary: {
        cloudName: string;
        apiKey: string;
        apiSecret: string;
    };
    mail: {
        host: string;
        port: number;
        user: string;
        pass: string;
        from: string;
        adminNotificationEmail: string;
    };
    throttle: {
        ttl: number;
        limit: number;
    };
};
export default _default;
