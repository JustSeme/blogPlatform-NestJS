import { Length } from "class-validator"
import { Transform } from "class-transformer"

export class NewPasswordInputModel {
    @Transform(({ value }) => value.trim())
    @Length(6, 20)
    newPassword: string

    recoveryCode: string
}