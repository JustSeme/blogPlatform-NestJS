import { PostDBModel } from "./PostsTypes"
import {
    Prop, Schema, SchemaFactory
} from "@nestjs/mongoose"
import {
 ExtendedLikesInfo, ExtendedLikesInfoSchema 
} from "./ExtendedLikesInfoSchema"

@Schema()
export class Post {
    @Prop({ required: true })
    id: string

    @Prop({
        required: true,
        min: 3,
        max: 30
    })
    title: string

    @Prop({
        required: true,
        min: 3,
        max: 100
    })
    shortDescription: string

    @Prop({
        required: true,
        min: 3,
        max: 1000
    })
    content: string

    @Prop({ required: true })
    blogId: string

    @Prop({ required: true })
    blogName: string

    @Prop({
 required: true, default: new Date() 
})
    createdAt: string

    @Prop({
 required: true, type: ExtendedLikesInfoSchema 
})
    extendedLikesInfo: ExtendedLikesInfo
}

export const PostSchema = SchemaFactory.createForClass<PostDBModel>(Post)