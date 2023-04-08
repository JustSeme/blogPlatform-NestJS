import { Length } from "class-validator"

export class NewPasswordInputModel {
    @Length(6, 20)
    newPassword: string

    recoveryCode: string
}