import mongoose from "mongoose"
import { PostDBModel } from "./PostsTypes"
import { Prop, SchemaFactory } from "@nestjs/mongoose"
import { ExtendedLikesInfo, ExtendedLikesInfoSchema } from "./ExtendedLikesInfoSchema"

export const postsSchema = new mongoose.Schema<PostDBModel>({
    id: { type: String, required: true },
    title: {
        type: String, required: true, min: 3, max: 30
    },
    shortDescription: {
        type: String, required: true, min: 3, max: 100
    },
    content: {
        type: String, required: true, min: 3, max: 1000
    },
    blogId: { type: String, required: true },
    blogName: { type: String, required: true },
    createdAt: { type: String, required: true },
    extendedLikesInfo: {
        likes: [{
            userId: String,
            createdAt: String,
            login: String,
        }],
        dislikes: [{
            userId: String,
            createdAt: String,
            login: String,
        }],
        noneEntities: [{
            userId: String,
            createdAt: String,
            login: String,
        }]
    }
})

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

    @Prop({ required: true, default: new Date() })
    createdAt: string

    @Prop({ required: true, type: ExtendedLikesInfoSchema })
    extendedLikesInfo: ExtendedLikesInfo
}

export const PostSchema = SchemaFactory.createForClass<PostDBModel>(Post)