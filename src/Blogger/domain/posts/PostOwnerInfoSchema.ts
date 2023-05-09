import {
    Prop, Schema, SchemaFactory
} from "@nestjs/mongoose"
import { PostOwnerInfoType } from "./PostsTypes"

@Schema()
export class PostOwnerInfo {
    @Prop({ required: true })
    userId: string

    @Prop({ required: true })
    userLogin: string
}

export const PostOwnerInfoSchema = SchemaFactory.createForClass<PostOwnerInfoType>(PostOwnerInfo)