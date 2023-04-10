import {
    Length, IsEmail, Matches
} from "class-validator"

export class UserInputModel {
    @Length(3, 10)
    @Matches('^[a-zA-Z0-9_-]*$')
    login: string

    @Length(6, 20)
    password: string

    @IsEmail()
    email: string
}