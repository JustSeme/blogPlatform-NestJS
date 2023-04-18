import { Length } from "class-validator"
import { TrimIfString } from "../../../general/decorators/trimIfString.decorator"

export class NewPasswordInputModel {
    @TrimIfString()
    @Length(6, 20)
    newPassword: string

    recoveryCode: string
}