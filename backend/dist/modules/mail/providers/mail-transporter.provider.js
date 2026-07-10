"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailTransporterProvider = exports.MAIL_TRANSPORTER = void 0;
const config_1 = require("@nestjs/config");
const nodemailer_1 = require("nodemailer");
exports.MAIL_TRANSPORTER = 'MAIL_TRANSPORTER';
exports.MailTransporterProvider = {
    provide: exports.MAIL_TRANSPORTER,
    inject: [config_1.ConfigService],
    useFactory: (configService) => {
        const mailConfig = configService.get('mail');
        return (0, nodemailer_1.createTransport)({
            host: mailConfig?.host,
            port: mailConfig?.port,
            secure: mailConfig?.port === 465,
            auth: {
                user: mailConfig?.user,
                pass: mailConfig?.pass,
            },
        });
    },
};
//# sourceMappingURL=mail-transporter.provider.js.map