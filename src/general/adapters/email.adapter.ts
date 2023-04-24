import nodemailer from 'nodemailer'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ConfigType } from '../../configuration/configuration'

@Injectable()
export class EmailAdapter {
    private gmailSettings: {
        GMAIL_LOGIN: string,
        GMAIL_APP_PASSWORD: string
    }

    constructor(private readonly configService: ConfigService<ConfigType>) {
        this.gmailSettings = this.configService.get('gmail')
    }

    async sendEmail(email: string, subject: string, messageBody: string) {
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: this.gmailSettings.GMAIL_LOGIN,
                pass: this.gmailSettings.GMAIL_APP_PASSWORD,
            },
        })

        const info = await transport.sendMail({
            from: `"Blog Platform" <${this.gmailSettings.GMAIL_LOGIN}>`,
            to: email,
            subject: subject,
            html: messageBody,
        })

        return info.accepted.length > 0
    }
}