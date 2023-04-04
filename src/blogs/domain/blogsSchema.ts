import {
    Prop, Schema, SchemaFactory
} from "@nestjs/mongoose"
import { BlogDBModel } from "./BlogsTypes"

/* export const blogsSchema = new mongoose.Schema<BlogViewModel>({
    id: { type: String, required: true },
    name: {
        type: String, required: true, min: 3, max: 15
    },
    description: {
        type: String, required: true, min: 3, max: 500
    },
    websiteUrl: {
        type: String, required: true, min: 3, max: 100
    },
    createdAt: { type: String, required: true },
    isMembership: { type: Boolean, required: true }
}) */

@Schema()
export class Blog {
    @Prop({ required: true })
    id: string

    @Prop({
        required: true,
        min: 3,
        max: 15,
    })
    name: string

    @Prop({
        required: true,
        min: 3,
        max: 500,
    })
    description: string

    @Prop({
        required: true,
        min: 3,
        max: 100,
    })
    websiteUrl: string

    @Prop({ required: true, })
    createdAt: string

    @Prop({ required: true, })
    isMembership: boolean
}

export const BlogsSchema = SchemaFactory.createForClass<BlogDBModel>(Blog)