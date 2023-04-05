import {
    Prop, Schema, SchemaFactory
} from "@nestjs/mongoose"
import { LikeObjectType, LikesInfoType } from "./CommentTypes"

@Schema()
export class LikesInfo {
    @Prop({ required: true })
    likes: LikeObjectType[]

    @Prop({ required: true, default: new Date().toISOString() })
    dislikes: LikeObjectType[]
}

export const LikesInfoSchema = SchemaFactory.createForClass<LikesInfoType>(LikesInfo)