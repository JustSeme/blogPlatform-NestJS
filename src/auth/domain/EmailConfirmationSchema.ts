import { EmailConfirmationType } from "./UsersTypes"
import {
    Prop, Schema, SchemaFactory
} from "@nestjs/mongoose"

@Schema()
export class EmailConfirmation {
    @Prop({ required: true })
    confirmationCode: string

    @Prop({ default: new Date() })
    expirationDate: Date

    @Prop({ default: false })
    isConfirmed: boolean
}

export const EmailConfirmationSchema = SchemaFactory.createForClass<EmailConfirmationType>(EmailConfirmation)