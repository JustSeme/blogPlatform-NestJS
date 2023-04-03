import { add } from "date-fns"
import { Model } from "mongoose"
import { HydratedUser } from "./UsersTypes"
import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose/dist"
import { User } from "../domain/UsersSchema"

//transaction script
@Injectable()
export class UsersRepository {
    constructor(@InjectModel(User.name) private UserModel: Model<User>) { }

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

    async findUserById(userId: string) {
        return this.UserModel.findOne({ id: userId }, { _id: 0, __v: 0 })
    }

    async save(user: HydratedUser) {
        return user.save()
    }
}