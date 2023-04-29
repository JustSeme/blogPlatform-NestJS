import {
    Prop, Schema, SchemaFactory
} from "@nestjs/mongoose"
import { BlogOwnerInfoType } from "./BlogsTypes"

@Schema()
export class BlogOwnerInfo {
    @Prop({
        required: true,
        default: 'superAdmin'
    })
    userId: string

    @Prop({
        required: true,
        default: 'superAdmin'
    })
    userLogin: string
}

export const BlogOwnerInfoSchema = SchemaFactory.createForClass<BlogOwnerInfoType>(BlogOwnerInfo)