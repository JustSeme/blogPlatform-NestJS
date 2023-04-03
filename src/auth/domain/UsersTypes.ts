import { add } from 'date-fns'
import { Model } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { User } from './UsersSchema'
import { HydratedUser } from '../infrastructure/UsersTypes'

export class UserDTO {
    public id: string
    public createdAt: string

    public emailConfirmation: EmailConfirmationType
    public passwordRecovery: PasswordConfirmationType

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
            confirmationCode: null,
            expirationDate: new Date()
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