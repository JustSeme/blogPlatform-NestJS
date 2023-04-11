import { Transform } from "class-transformer"
import {
    Length, IsEmail, Matches
} from "class-validator"

export class UserInputModel {
    @Transform(({ value }) => value.trim())
    @Length(3, 10)
    @Matches('^[a-zA-Z0-9_-]*$')
    login: string

    @Transform(({ value }) => value.trim())
    @Length(6, 20)
    password: string

    @IsEmail()
    email: string
}