import {
    Prop, Schema, SchemaFactory
} from "@nestjs/mongoose"
import { BlogBanInfoType } from "./BlogsTypes"

@Schema()
export class BlogBanInfo {
    @Prop({
        required: true,
        default: false
    })
    isBanned: boolean

    @Prop({
        required: true,
        default: () => new Date()
    })
    banDate: Date
}

export const BlogBanInfoSchema = SchemaFactory.createForClass<BlogBanInfoType>(BlogBanInfo)