import { Injectable } from "@nestjs/common"
import { EmailAdapter } from "../adapters/email.adapter"

@Injectable()
export class EmailManager {
    constructor(private emailAdapter: EmailAdapter) { }
    async sendConfirmationCode(recipientEmail: string, recipientLogin: string, confirmationCode: string) {
        const messageBody = `
            <h1>Hello, dear ${recipientLogin}! Welcome to the Blog Platform!</h1>
            <div>
                <p>To continue registration, </p><a href='https://some-front.com/confirm-registration?code=${confirmationCode}'>click here</a>
            </div>
        `
        return this.emailAdapter.sendEmail(recipientEmail, 'ConfirmationCode', messageBody)
    }

    async sendPasswordRecoveryCode(recipientEmail: string, recipientLogin: string, confirmationCode: string) {
        const messageBody = `
            <h1>${recipientLogin}, we revice notification, that you want to recover your password</h1>
            <div>
                <b>If you haven't tried to recover your password, ignore this message!</b>
                <p>To continue password recovering, </p><a href='https://some-front.com/password-recovery?recoveryCode=${confirmationCode}'>click here</a>
            </div>
        `
        return this.emailAdapter.sendEmail(recipientEmail, 'Recovery Password', messageBody)
    }
}