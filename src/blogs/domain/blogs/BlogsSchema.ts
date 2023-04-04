import {
    Prop, Schema, SchemaFactory
} from "@nestjs/mongoose"
import { BlogDBModel } from "./BlogsTypes"

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

export const BlogSchema = SchemaFactory.createForClass<BlogDBModel>(Blog)