import { PasswordConfirmationType } from "../UsersTypes"
import {
    Prop, Schema, SchemaFactory
} from "@nestjs/mongoose/dist"

@Schema()
export class PasswordRecovery {
    @Prop({ required: true })
    confirmationCode: string

    @Prop({ default: () => new Date() })
    expirationDate: Date
}

export const PasswordRecoverySchema = SchemaFactory.createForClass<PasswordConfirmationType>(PasswordRecovery)