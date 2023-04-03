import { EmailConfirmationType } from "./UsersTypes"
import {
    Prop, Schema, SchemaFactory
} from "@nestjs/mongoose"

@Schema()
export class EmailConfirmation {
    @Prop()
    confirmationCode: string

    @Prop()
    expirationDate: Date

    @Prop()
    isConfirmed: boolean
}

export const EmailConfirmationSchema = SchemaFactory.createForClass<EmailConfirmationType>(EmailConfirmation)