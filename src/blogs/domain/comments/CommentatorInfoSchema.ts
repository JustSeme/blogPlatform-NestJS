import {
    Prop, Schema, SchemaFactory
} from "@nestjs/mongoose"
import { CommentatorInfoType } from "./CommentTypes"

@Schema()
export class CommentatorInfo {
    @Prop({ required: true })
    userId: string

    @Prop({ required: true })
    userLogin: string
}

export const CommentatorInfoSchema = SchemaFactory.createForClass<CommentatorInfoType>(CommentatorInfo)