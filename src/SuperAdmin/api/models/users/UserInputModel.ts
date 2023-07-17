import {
    Length, IsEmail, Matches, Validate
} from "class-validator"
import { TrimIfString } from "../../../../general/decorators/trimIfString.decorator"
import { IsEmailAlreadyInUse } from "../../../../auth/api/decorators/IsEmailAlreadyInUse"
import { IsLoginAlreadyInUse } from "../../../../auth/api/decorators/IsLoginAlreadyInUse"

export class UserInputModel {
    @TrimIfString()
    @Length(3, 10)
    @Matches('^[a-zA-Z0-9_-]*$')
    @Validate(IsLoginAlreadyInUse)
    login: string

    @TrimIfString()
    @Length(6, 20)
    password: string

    @IsEmail()
    @Validate(IsEmailAlreadyInUse)
    email: string
}