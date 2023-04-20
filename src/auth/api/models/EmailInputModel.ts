import { IsEmail } from "class-validator"

export class EmailInputModel {
    @IsEmail()
    email: string
}