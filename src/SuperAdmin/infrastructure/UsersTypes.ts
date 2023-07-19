import { HydratedDocument } from "mongoose"
import { User } from "../domain/mongoose/UsersSchema"
import {
    EmailConfirmationType, PasswordConfirmationType
} from "../domain/UsersTypes"
import { BanInfoDBType } from "../application/dto/users/UsersViewModel"
import { UserEntity } from "../domain/typeORM/user.entity"
import { UserEmailConfirmation } from "../domain/typeORM/users/user-email-confirmation.entity"
import { UserPasswordRecovery } from "../domain/typeORM/users/user-password-recovery.entity"
import { UserBanInfo } from "../domain/typeORM/users/user-ban-info.entity"

export type HydratedUser = HydratedDocument<User>

export class UserDBModel {
    public id: string
    public login: string
    public email: string
    public passwordHash: string
    public createdAt: Date
    public emailConfirmation: EmailConfirmationType
    public passwordRecovery: PasswordConfirmationType
    public banInfo: BanInfoDBType

    constructor(user: UserEntity & UserEmailConfirmation & UserPasswordRecovery & UserBanInfo) {
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

export type UserEntitiesType = UserEntity | UserBanInfo | UserEmailConfirmation | UserPasswordRecovery