import nodemailer from 'nodemailer'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class EmailAdapter {
    private gmailLogin: string
    private gmailAppPassword: string

    constructor(private readonly configService: ConfigService) {
        this.gmailLogin = this.configService.get('GMAIL_LOGIN')
        this.gmailAppPassword = this.configService.get('GMAIL_APP_PASSWORD')
    }

    async sendEmail(email: string, subject: string, messageBody: string) {
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: this.gmailLogin,
                pass: this.gmailAppPassword,
            },
        })

        const info = await transport.sendMail({
            from: `"Blog Platform" <${this.gmailLogin}>`,
            to: email,
            subject: subject,
            html: messageBody,
        })

        return info.accepted.length > 0
    }
}