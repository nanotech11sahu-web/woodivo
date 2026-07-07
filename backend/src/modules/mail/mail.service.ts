import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Transporter } from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import { MAIL_TRANSPORTER } from './providers/mail-transporter.provider';
import type { MailConfig } from '@config/configuration';
import {
  buildEnquiryNotificationEmail,
  EnquiryNotificationData,
} from './templates/enquiry-notification.template';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    @Inject(MAIL_TRANSPORTER)
    private readonly transporter: Transporter<SMTPTransport.SentMessageInfo>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Fire-and-forget by design: a failed notification email must never fail
   * the enquiry submission itself. Callers should not await this on the
   * critical path — the enquiry is already saved before this runs.
   */
  async sendEnquiryNotification(data: EnquiryNotificationData): Promise<void> {
    const mailConfig = this.configService.get<MailConfig>('mail');
    if (!mailConfig?.adminNotificationEmail) {
      this.logger.warn(
        'ADMIN_NOTIFICATION_EMAIL not configured — skipping enquiry notification email',
      );
      return;
    }

    const { subject, html } = buildEnquiryNotificationEmail(data);

    try {
      await this.transporter.sendMail({
        from: mailConfig.from,
        to: mailConfig.adminNotificationEmail,
        subject,
        html,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send enquiry notification email: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
