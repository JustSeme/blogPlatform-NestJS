import {
    Prop, SchemaFactory
} from "@nestjs/mongoose"
import { AttemptDTO } from "./AttemptsType"

export class Attempt {
    @Prop({ required: true })
    clientIp: string

    @Prop({ required: true })
    requestedUrl: string

    @Prop({
        required: true,
        default: () => new Date()
    })
    requestDate: Date
}

export const AttemptsSchema = SchemaFactory.createForClass<AttemptDTO>(Attempt)
