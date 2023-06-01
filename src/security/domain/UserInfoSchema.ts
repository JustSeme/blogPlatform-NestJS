import {
    Prop, Schema, SchemaFactory
} from '@nestjs/mongoose'
import { UserInfoType } from './DeviceAuthSessionTypes'

@Schema()
export class UserInfo {
    @Prop({ required: true })
    userId: string

    @Prop({ required: true })
    userIp: string
}

export const UserInfoSchema = SchemaFactory.createForClass<UserInfoType>(UserInfo)
