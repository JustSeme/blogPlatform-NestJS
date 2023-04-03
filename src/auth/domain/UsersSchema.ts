import { HydratedDocument } from "mongoose"
import {
    UserDBMethodsType, UserDTO, UserModelFullType
} from "./UsersTypes"
import { EmailConfirmation } from "./EmailConfirmationSchema"
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

    @Prop()
    emailConfirmation: typeof EmailConfirmation

    @Prop()
    passwordRecovery: typeof PasswordRecovery

}

export const UsersSchema = SchemaFactory.createForClass(User)

UsersSchema.method('canBeConfirmed', function canBeConfirmed(code: string) {
    const that = this as UserDTO & UserDBMethodsType
    if (that.emailConfirmation.isConfirmed) return false
    if (that.emailConfirmation.confirmationCode !== code) return false
    if (that.emailConfirmation.expirationDate < new Date()) return false

    return true
})

UsersSchema.method('updateIsConfirmed', function updateIsConfirmed() {
    const that = this as UserDTO & UserDBMethodsType

    that.emailConfirmation.isConfirmed = true
    return true
})


/* UsersSchema.static('makeInstance', function makeInstance(login: string, email: string, passwordHash: string, isConfirmed: boolean) {
    const userDTO = new UserDTO(login, email, passwordHash, isConfirmed)
    return new UserModel(userDTO)
}) */