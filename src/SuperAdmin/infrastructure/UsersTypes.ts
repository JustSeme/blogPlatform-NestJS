import { HydratedDocument } from "mongoose"
import { User } from "../domain/mongoose/UsersSchema"
import {
    EmailConfirmationType, PasswordConfirmationType
} from "../domain/UsersTypes"
import { BanInfoDBType } from "../application/dto/UsersViewModel"

export type HydratedUser = HydratedDocument<User>

export class UserSQLModel {
    public id: string
    public login: string
    public email: string
    public createdAt: string
    public isBanned: boolean
    public banReason: string
    public banDate: Date
    public passwordHash: string
    public emailConfirmationCode: string
    public emailExpirationDate: Date
    public isEmailConfirmed: boolean
    public passwordRecoveryConfirmationCode: string
    public passwordRecoveryExpirationDate: Date
}

export class UserDBModel {
    public id: string
    public login: string
    public email: string
    public passwordHash: string
    public createdAt: string
    public emailConfirmation: EmailConfirmationType
    public passwordRecovery: PasswordConfirmationType
    public banInfo: BanInfoDBType

    constructor(user: UserSQLModel) {
        this.id = user.id
        this.login = user.login
        this.email = user.email
        this.passwordHash = user.passwordHash
        this.createdAt = user.createdAt
        this.emailConfirmation = {
            confirmationCode: user.emailConfirmationCode,
            expirationDate: user.emailExpirationDate,
            isConfirmed: user.isEmailConfirmed
        }
        this.passwordRecovery = {
            confirmationCode: user.passwordRecoveryConfirmationCode,
            expirationDate: user.passwordRecoveryExpirationDate
        }
        this.banInfo = {
            isBanned: user.isBanned,
            banDate: user.banDate,
            banReason: user.banReason
        }
    }

}