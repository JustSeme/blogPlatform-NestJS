import {
    Prop, Schema, SchemaFactory
} from "@nestjs/mongoose"
import mongoose from "mongoose"
import { BanInfoDBType } from "../application/dto/UsersViewModel"

@Schema()
export class BanInfo {
    @Prop({
        required: true,
        default: () => new mongoose.Types.ObjectId()
    })
    _id: mongoose.Types.ObjectId

    @Prop({
        required: true,
        default: false
    })
    isBanned: boolean

    @Prop({ default: new Date() })
    banDate: Date

    @Prop({ default: false })
    banReason: string
}

export const BanInfoSchema = SchemaFactory.createForClass<BanInfoDBType>(BanInfo)