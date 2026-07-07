import { Module } from '@nestjs/common';
import { MailTransporterProvider } from './providers/mail-transporter.provider';
import { MailService } from './mail.service';

@Module({
  providers: [MailTransporterProvider, MailService],
  exports: [MailTransporterProvider, MailService],
})
export class MailModule {}
