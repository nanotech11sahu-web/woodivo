import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import type { MailConfig } from '@config/configuration';

export const MAIL_TRANSPORTER = 'MAIL_TRANSPORTER';

export const MailTransporterProvider: Provider = {
  provide: MAIL_TRANSPORTER,
  inject: [ConfigService],
  useFactory: (
    configService: ConfigService,
  ): Transporter<SMTPTransport.SentMessageInfo> => {
    const mailConfig = configService.get<MailConfig>('mail');

    return createTransport({
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
