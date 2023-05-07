import { add } from 'date-fns'
import mongoose, { Model } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { User } from './UsersSchema'
import { HydratedUser } from '../infrastructure/UsersTypes'
import { BanInfoDBType } from '../application/dto/UsersViewModel'

export class UserDTO {
    public id: string
    public createdAt: string

    public emailConfirmation: EmailConfirmationType
    public passwordRecovery: PasswordConfirmationType
    public banInfo: BanInfoDBType

    constructor(
        public login: string,
        public email: string,
        public passwordHash: string,
        isConfirmed: boolean
    ) {
        this.id = uuidv4()
        this.createdAt = new Date().toISOString()
        this.emailConfirmation = {
            confirmationCode: uuidv4(),
            expirationDate: add(new Date(), {
                hours: 1,
                minutes: 3
            }),
            isConfirmed: isConfirmed
        }

        this.passwordRecovery = {
            confirmationCode: '',
            expirationDate: new Date()
        }

        this.banInfo = {
            _id: new mongoose.Types.ObjectId(),
            isBanned: false,
            banDate: null,
            banReason: null,
        }
    }
}

export type EmailConfirmationType = {
    confirmationCode: string
    expirationDate: Date
    isConfirmed: boolean
}

export type PasswordConfirmationType = {
    confirmationCode: string | null
    expirationDate: Date
}

export type UserModelStaticType = {
    makeInstance: (login: string, email: string, passwordHash: string, isConfirmed: boolean, UserModel: UserModelType) => HydratedUser
}

export type UserModelType = Model<User> & UserModelStaticType