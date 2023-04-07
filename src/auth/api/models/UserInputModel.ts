import {
    Length, IsEmail, IsAlphanumeric
} from "class-validator"

export class UserInputModel {
    @Length(3, 10)
    @IsAlphanumeric()
    login: string

    @Length(6, 20)
    password: string

    @IsEmail()
    email: string
}