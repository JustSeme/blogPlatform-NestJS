import { HydratedDocument } from "mongoose"
import {
    UserDTO, UserModelStaticType, UserModelType
} from "./UsersTypes"
import { EmailConfirmation, EmailConfirmationSchema } from "./EmailConfirmationSchema"
import { PasswordRecovery } from "./PasswordRecoverySchema"
import {
    Schema, Prop, SchemaFactory
} from "@nestjs/mongoose"

/* const usersSchema = new mongoose.Schema<UserDTO, UserModelFullType, UserDBMethodsType>({
    id: { type: String, required: true },
    login: { type: String, required: true },
    email: { type: String, required: true },
    passwordHash: { type: String, required: true },
    createdAt: { type: String, required: true },
    emailConfirmation: EmailConfirmationSchema,
    passwordRecovery: PasswordRecoverySchema,
}, { autoCreate: false, autoIndex: false })

export const UsersModel = mongoose.model<UserDTO, UserModelFullType>('users', usersSchema) */

export type CatDocument = HydratedDocument<User>

@Schema()
export class User {
    @Prop({ required: true })
    id: string

    @Prop({ required: true })
    login: string

    @Prop({ required: true })
    email: string

    @Prop({ required: true })
    passwordHash: string

    @Prop({ required: true })
    createdAt: string

    @Prop({ required: true, type: EmailConfirmationSchema })
    emailConfirmation: EmailConfirmation

    @Prop({ required: true, type: EmailConfirmationSchema })
    passwordRecovery: PasswordRecovery

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

    static makeInstance(login: string, email: string, passwordHash: string, isConfirmed: boolean, UserModel: UserModelType) {
        const userDTO = new UserDTO(login, email, passwordHash, isConfirmed)
        return new UserModel(userDTO)
    }
}

export const UsersSchema = SchemaFactory.createForClass<UserDTO>(User)
UsersSchema.methods = {
    canBeConfirmed: User.prototype.canBeConfirmed,
    updateIsConfirmed: User.prototype.updateIsConfirmed
}

const userStaticMethods: UserModelStaticType = { makeInstance: User.makeInstance }
UsersSchema.statics = userStaticMethods


/* UsersSchema.static('makeInstance', function ) */