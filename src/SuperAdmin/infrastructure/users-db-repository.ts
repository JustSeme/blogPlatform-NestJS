import { add } from "date-fns"
import { HydratedUser } from "./UsersTypes"
import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose/dist"
import { User } from "../domain/mongoose/UsersSchema"
import { UserModelType } from "../domain/UsersTypes"
import { BanUserForBlogInfoType } from "../../Blogger/infrastructure/blogs/BanUserForBlogInfoType"

//transaction script
@Injectable()
export class UsersRepository {
    constructor(@InjectModel(User.name) private UserModel: UserModelType) { }

    async deleteUser(id: string): Promise<boolean> {
        const deletedUser = this.UserModel.find({ id })
        const result = await deletedUser.deleteOne()
        return result.deletedCount === 1
    }

    async updateEmailConfirmationInfo(id: string, code: string) {
        const result = await this.UserModel.updateOne({ id: id }, {
            $set: {
                'emailConfirmation.confirmationCode': code,
                'emailConfirmation.expirationDate': add(new Date(), {
                    hours: 1,
                    minutes: 3
                })
            }
        })
        return result.matchedCount === 1
    }

    async updatePasswordConfirmationInfo(id: string, code: string | null) {
        const result = await this.UserModel.updateOne({ id: id }, {
            $set: {
                'passwordRecovery.confirmationCode': code,
                'passwordRecovery.expirationDate': add(new Date(), {
                    hours: 1,
                    minutes: 3
                })
            }
        })
        return result.matchedCount === 1
    }

    async updateUserPassword(id: string, newPasswordHash: string) {
        const result = await this.UserModel.updateOne({ id: id }, {
            $set: {
                'passwordHash': newPasswordHash,
                'passwordRecovery.confirmationCode': null
            }
        })

        return result.matchedCount === 1
    }

    async findUserByConfirmationCode(code: string): Promise<HydratedUser | null> {
        return this.UserModel.findOne({ 'emailConfirmation.confirmationCode': code })
    }

    async findUserByEmail(email: string) {
        return this.UserModel.findOne({ email: email })
    }

    async findUserByLoginOrEmail(loginOrEmail: string): Promise<HydratedUser | null> {
        return this.UserModel.findOne({ $or: [{ login: loginOrEmail }, { email: loginOrEmail }] })
    }

    async findUserById(userId: string): Promise<HydratedUser> {
        return this.UserModel.findOne({ id: userId })
    }

    async save(user: HydratedUser) {
        return user.save()
    }

    async isUserExists(userId: string) {
        const user = await this.findUserById(userId)
        return user ? true : false
    }

    async banUserForCurrentBlog(userId: string, banInfo: BanUserForBlogInfoType) {
        const user = await this.findUserById(userId)

        user.bansForBlog.push(banInfo)
        await this.save(user)
    }

    async unbanUserForCurrentBlog(userId: string, blogId: string) {
        const user = await this.findUserById(userId)

        const banIndex = user.bansForBlog.findIndex(ban => ban.blogId === blogId)
        user.bansForBlog.splice(banIndex, 1)

        await user.save()
    }
}