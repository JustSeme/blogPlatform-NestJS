import {
    Prop, Schema, SchemaFactory
} from "@nestjs/mongoose"
import { BanInfoType } from "../../../SuperAdmin/application/dto/UsersViewModel"

@Schema()
export class BanInfo {
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

export const BanInfoSchema = SchemaFactory.createForClass<BanInfoType>(BanInfo)