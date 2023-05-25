import {
    Prop, Schema, SchemaFactory
} from "@nestjs/mongoose"
import { BlogBanInfoType } from "./BlogsSchema"

@Schema()
export class BlogBanInfo {
    @Prop({
        required: true,
        default: false
    })
    isBanned: boolean

    @Prop({ default: null })
    banDate: Date | null
}

export const BlogBanInfoSchema = SchemaFactory.createForClass<BlogBanInfoType>(BlogBanInfo)