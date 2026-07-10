"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const app_module_1 = require("./app.module");
const app_constants_1 = require("./common/constants/app.constants");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        bufferLogs: true,
    });
    const configService = app.get(config_1.ConfigService);
    const appConfig = configService.get('app');
    app.setGlobalPrefix(app_constants_1.API_PREFIX);
    app.use((0, helmet_1.default)());
    app.use((0, compression_1.default)());
    app.enableCors({
        origin: appConfig?.corsOrigins?.length ? appConfig.corsOrigins : true,
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.enableShutdownHooks();
    const port = appConfig?.port ?? 4000;
    await app.listen(port);
    common_1.Logger.log(`🚀 WOODIVO API running on http://localhost:${port}/${app_constants_1.API_PREFIX}`, 'Bootstrap');
}
void bootstrap();
//# sourceMappingURL=main.js.map