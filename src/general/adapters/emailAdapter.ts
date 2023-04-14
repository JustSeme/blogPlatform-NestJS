import nodemailer from 'nodemailer'
import { Settings } from "../../Settings"
import { Injectable } from '@nestjs/common'

@Injectable()
export class EmailAdapter {
    constructor(protected settings: Settings) { }

    async sendEmail(email: string, subject: string, messageBody: string) {
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: this.settings.GMAIL_LOGIN,
                pass: this.settings.GMAIL_APP_PASSWORD,
            },
        })

        const info = await transport.sendMail({
            from: `"Blog Platform" <${this.settings.GMAIL_LOGIN}>`,
            to: email,
            subject: subject,
            html: messageBody,
        })

        return info.accepted.length > 0
    }
}