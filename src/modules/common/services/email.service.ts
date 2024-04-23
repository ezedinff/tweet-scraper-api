import { Inject, Injectable } from '@nestjs/common';
import { FROM_EMAIL, RESEND_EMAIL, TO_EMAIL } from '../constants';
import { Resend } from 'resend';
import { catchError, from, lastValueFrom, map, mergeMap, timer } from 'rxjs';

@Injectable()
export class EmailService {
  constructor(
    @Inject(RESEND_EMAIL) private readonly resend: Resend,
    @Inject(FROM_EMAIL) private readonly fromEmail: string,
    @Inject(TO_EMAIL) private readonly toEmail: string,
  ) {}

  async sendEmail(content: string, subject: string): Promise<string> {
    return lastValueFrom(
      from(
        this.resend.emails.send({
          from: this.fromEmail,
          to: this.toEmail,
          subject,
          html: content,
        }),
      ).pipe(
        map(({ data, error }) => {
          if (error) {
            throw error;
          }
          return data?.id;
        }),
        catchError((error) => {
          if (error?.statusCode === 429) {
            // retry after 1 second
            return timer(1000).pipe(
              mergeMap(() => this.sendEmail(content, subject)),
            );
          }
        }),
      ),
    );
  }

  getVideoFoundTemplate(): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Video Found</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          border: 1px solid #ccc;
          border-radius: 5px;
          background-color: #f9f9f9;
        }
        h1 {
          font-size: 24px;
          font-weight: bold;
          color: #333;
          margin-top: 0;
        }
        p {
          font-size: 16px;
          color: #666;
        }
        a {
          color: #007bff;
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>New Video Found</h1>
        <p>Hello there,</p>
        <p>We're excited to inform you that a new video has been found on Twitter.</p>
        <p>Explore the latest content by visiting CoinDesk's Twitter profile:</p>
        <p><a href="https://twitter.com/CoinDesk" target="_blank">Twitter Profile</a></p>
        <p>Thank you for staying updated!</p>
        <p>Best regards,<br>Your Team</p>
      </div>
    </body>
    </html>
    `;
  }
}
