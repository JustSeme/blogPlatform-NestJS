import {
    Prop, Schema, SchemaFactory
} from "@nestjs/mongoose"
import { PostInfoType } from "../../../application/dto/PostInfoType"

@Schema()
export class PostInfo {
    @Prop({ required: true })
    id: string

    @Prop({ required: true })
    title: string

    @Prop({ required: true })
    blogId: string

    @Prop({ required: true })
    blogName: string
}

export const PostInfoSchema = SchemaFactory.createForClass<PostInfoType>(PostInfo)