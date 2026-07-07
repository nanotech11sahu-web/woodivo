import { ConfigService } from '@nestjs/config';
import type { Transporter } from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import { EnquiryNotificationData } from './templates/enquiry-notification.template';
export declare class MailService {
    private readonly transporter;
    private readonly configService;
    private readonly logger;
    constructor(transporter: Transporter<SMTPTransport.SentMessageInfo>, configService: ConfigService);
    sendEnquiryNotification(data: EnquiryNotificationData): Promise<void>;
}
