import {
    Prop, Schema, SchemaFactory
} from "@nestjs/mongoose"
import {
    ExtendedLikeObjectType, ExtendedLikesInfoDBType
} from "./PostsTypes"

@Schema()
export class ExtendedLikesInfo {
    @Prop({ required: true })
    likes: ExtendedLikeObjectType[]

    @Prop({ required: true })
    dislikes: ExtendedLikeObjectType[]

    @Prop({ required: true })
    noneEntities: ExtendedLikeObjectType[]
}

export const ExtendedLikesInfoSchema = SchemaFactory.createForClass<ExtendedLikesInfoDBType>(ExtendedLikesInfo)