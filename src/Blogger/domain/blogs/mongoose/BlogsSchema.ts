import {
    Prop, Schema, SchemaFactory
} from "@nestjs/mongoose"
import { BlogDTO } from "../BlogsTypes"
import {
    BlogOwnerInfo, BlogOwnerInfoSchema
} from "./BlogOwnerInfoSchema"
import { BlogBanInfoSchema } from "./BlogBanInfoSchema"

export type BlogBanInfoType = {
    isBanned: boolean
    banDate: Date | null
}

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

    @Prop({
        required: true,
        type: BlogOwnerInfoSchema
    })
    blogOwnerInfo: BlogOwnerInfo

    @Prop({
        required: true,
        type: BlogBanInfoSchema
    })
    banInfo: BlogBanInfoType

    isCurrentUserOwner(currentUserId: string) {
        return this.blogOwnerInfo.userId === currentUserId
    }
}

export const BlogSchema = SchemaFactory.createForClass<BlogDTO>(Blog)

BlogSchema.methods = { isCurrentUserOwner: Blog.prototype.isCurrentUserOwner }