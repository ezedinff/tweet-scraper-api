import { Module } from '@nestjs/common';
import { EmailService } from './services/email.service';
import { ImageService } from './services/image.service';
import { Resend } from 'resend';
import { FROM_EMAIL, RESEND_EMAIL, TO_EMAIL } from './constants';

@Module({
  providers: [
    EmailService,
    ImageService,
    {
      provide: RESEND_EMAIL,
      useValue: new Resend(process.env.RESEND_API_KEY),
    },
    {
      provide: FROM_EMAIL,
      useValue: process.env.FROM_EMAIL,
    },
    {
      provide: TO_EMAIL,
      useValue: process.env.TO_EMAIL,
    },
  ],
  exports: [EmailService, ImageService],
})
export class CommonModule {}
