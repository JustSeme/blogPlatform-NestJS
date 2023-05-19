import {
    Prop, Schema, SchemaFactory
} from "@nestjs/mongoose"
import { BanUserForBlogInfoType } from "../../Blogger/infrastructure/blogs/BanUserForBlogInfoType"

@Schema()
export class BanForBlog {
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

    @Prop({
        required: true,
        default: false
    })
    banReason: string

    @Prop({ required: true })
    blogId: string
}

export const BansForBlogSchema = SchemaFactory.createForClass<BanUserForBlogInfoType>(BanForBlog)