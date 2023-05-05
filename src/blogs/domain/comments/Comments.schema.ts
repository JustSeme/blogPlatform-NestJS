import {
    Prop, Schema, SchemaFactory
} from "@nestjs/mongoose"
import { CommentDBModel } from "./CommentTypes"
import {
    CommentatorInfo, CommentatorInfoSchema
} from "./CommentatorInfoSchema"
import {
    LikesInfo, LikesInfoSchema
} from "./LikesInfoSchema"

@Schema()
export class CommentEntity {
    @Prop({ required: true })
    id: string

    @Prop({
        required: true, min: 20, max: 300
    })
    content: string

    @Prop({
        required: true, default: new Date().toISOString()
    })
    createdAt: string

    @Prop({ required: true })
    postId: string

    @Prop({
        required: true, type: CommentatorInfoSchema
    })
    commentatorInfo: CommentatorInfo

    @Prop({
        required: true, type: LikesInfoSchema
    })
    likesInfo: LikesInfo

    @Prop({
        required: true,
        default: false,
    })
    isBanned: boolean
}

export const CommentsSchema = SchemaFactory.createForClass<CommentDBModel>(CommentEntity)

CommentsSchema.methods = {}