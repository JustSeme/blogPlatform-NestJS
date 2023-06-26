import { add } from 'date-fns'
import { Model } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { User } from './mongoose/UsersSchema'
import { HydratedUser } from '../infrastructure/UsersTypes'
import { BanInfoDBType } from '../application/dto/UsersViewModel'
import { BanUserForBlogInfoType } from '../../Blogger/infrastructure/blogs/BanUserForBlogInfoType'

export class UserDTO {
    public emailConfirmation: EmailConfirmationType
    public passwordRecovery: PasswordConfirmationType
    public banInfo: BanInfoDBType
    public bansForBlog: Array<BanUserForBlogInfoType>

    constructor(
        public login: string,
        public email: string,
        public passwordHash: string,
        isConfirmed: boolean
    ) {
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
            expirationDate: null
        }

        this.banInfo = {
            isBanned: false,
            banDate: null,
            banReason: null,
        }

        this.bansForBlog = []
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