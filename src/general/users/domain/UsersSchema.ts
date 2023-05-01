import {
    UserDTO, UserModelStaticType, UserModelType
} from "./UsersTypes"
import {
    EmailConfirmation, EmailConfirmationSchema
} from "./EmailConfirmationSchema"
import { PasswordRecovery } from "./PasswordRecoverySchema"
import {
    Schema, Prop, SchemaFactory
} from "@nestjs/mongoose"
import { BanInfoSchema } from "./BanInfoSchema"
import { BanInputModel } from "../../../SuperAdmin/api/models/BanInputModel"
import { BanInfoDBType } from "../../../SuperAdmin/application/dto/UsersViewModel"

@Schema()
export class User {
    @Prop({ required: true })
    id: string

    @Prop({
        required: true, min: 3, max: 10
    })
    login: string

    @Prop({ required: true })
    email: string

    @Prop({ required: true })
    passwordHash: string

    @Prop({ required: true })
    createdAt: string

    @Prop({
        required: true, type: EmailConfirmationSchema
    })
    emailConfirmation: EmailConfirmation

    @Prop({
        required: true, type: EmailConfirmationSchema
    })
    passwordRecovery: PasswordRecovery

    @Prop({
        required: true, type: BanInfoSchema
    })
    banInfo: BanInfoDBType

    canBeConfirmed(code: string) {
        if (this.emailConfirmation.isConfirmed) return false
        if (this.emailConfirmation.confirmationCode !== code) return false
        if (this.emailConfirmation.expirationDate < new Date()) return false

        return true
    }

    updateIsConfirmed() {
        this.emailConfirmation.isConfirmed = true
        return true
    }

    isBanned() {
        return this.banInfo.isBanned
    }

    banCurrentUser(banInputModel: BanInputModel): boolean {
        this.banInfo = {
            _id: this.banInfo._id,
            isBanned: banInputModel.isBanned,
            banReason: banInputModel.banReason,
            banDate: new Date(),
        }
        return true
    }

    static makeInstance(login: string, email: string, passwordHash: string, isConfirmed: boolean, UserModel: UserModelType) {
        const userDTO = new UserDTO(login, email, passwordHash, isConfirmed)
        return new UserModel(userDTO)
    }
}

export const UsersSchema = SchemaFactory.createForClass<UserDTO>(User)
UsersSchema.methods = {
    canBeConfirmed: User.prototype.canBeConfirmed,
    updateIsConfirmed: User.prototype.updateIsConfirmed,
    banCurrentUser: User.prototype.banCurrentUser,
    isBanned: User.prototype.isBanned
}

const userStaticMethods: UserModelStaticType = { makeInstance: User.makeInstance }
UsersSchema.statics = userStaticMethods