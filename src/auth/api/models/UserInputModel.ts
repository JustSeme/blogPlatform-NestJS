import {
    Length, IsEmail, Matches, Validate
} from "class-validator"
import { TrimIfString } from "../../../general/decorators/trimIfString.decorator"
import { IsEmailAlreadyInUse } from "../decorators/IsEmailAlreadyInUse"
import { IsLoginAlreadyInUse } from "../decorators/IsLoginAlreadyInUse"

export class UserInputModel {
    @TrimIfString()
    @Length(3, 10)
    @Matches('^[a-zA-Z0-9_-]*$')
    @Validate(IsLoginAlreadyInUse)
    login: string

    @TrimIfString()
    @Length(6, 20)
    @Validate(IsEmailAlreadyInUse)
    password: string

    @IsEmail()
    email: string
}