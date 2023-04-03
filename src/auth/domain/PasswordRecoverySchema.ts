import { PasswordConfirmationType } from "./UsersTypes"
import {
    Prop, Schema, SchemaFactory
} from "@nestjs/mongoose/dist"

@Schema()
export class PasswordRecovery {
    @Prop()
    confirmationCode: string

    @Prop()
    expirationDate: Date
}

export const PasswordRecoverySchema = SchemaFactory.createForClass<PasswordConfirmationType>(PasswordRecovery)