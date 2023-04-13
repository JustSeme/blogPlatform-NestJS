import { AttemptsDBModel } from "./AttemptsTypes"
import {
    Prop, Schema, SchemaFactory
} from "@nestjs/mongoose"

@Schema()
export class Attempt {
    @Prop({ required: true })
    clientIp: string

    @Prop({ required: true })
    requestedUrl: string

    @Prop({
        required: true,
        default: new Date()
    })
    requestDate: Date
}

export const AttemptSchema = SchemaFactory.createForClass<AttemptsDBModel>(Attempt)