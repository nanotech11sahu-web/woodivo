"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
const SERVER_ERROR_THRESHOLD = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
let AllExceptionsFilter = class AllExceptionsFilter {
    logger = new common_1.Logger('ExceptionFilter');
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const statusCode = exception instanceof common_1.HttpException
            ? exception.getStatus()
            : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        const message = this.extractMessage(exception);
        const errorName = exception instanceof Error ? exception.name : 'InternalServerError';
        const body = {
            success: false,
            statusCode,
            message,
            error: errorName,
            path: request.originalUrl,
            timestamp: new Date().toISOString(),
        };
        if (statusCode >= SERVER_ERROR_THRESHOLD) {
            this.logger.error(`${request.method} ${request.originalUrl} - ${message}`, exception instanceof Error ? exception.stack : undefined);
        }
        else {
            this.logger.warn(`${request.method} ${request.originalUrl} - ${message}`);
        }
        response.status(statusCode).json(body);
    }
    extractMessage(exception) {
        if (exception instanceof common_1.HttpException) {
            const response = exception.getResponse();
            if (typeof response === 'string') {
                return response;
            }
            if (typeof response === 'object' &&
                response !== null &&
                'message' in response) {
                const msg = response.message;
                return Array.isArray(msg) ? msg.join(', ') : String(msg);
            }
            return exception.message;
        }
        if (exception instanceof Error) {
            return 'Internal server error';
        }
        return 'Internal server error';
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = __decorate([
    (0, common_1.Catch)()
], AllExceptionsFilter);
//# sourceMappingURL=all-exceptions.filter.js.map