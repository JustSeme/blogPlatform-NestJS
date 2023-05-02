import {
    Prop, Schema, SchemaFactory
} from "@nestjs/mongoose"
import {
    UserInfo, UserInfoSchema
} from "./UserInfoSchema"
import {
    DeviceInfo, DeviceInfoSchema
} from "./DeviceInfoSchema"
import { DeviceAuthSessionDBModel } from "./DeviceAuthSessionType"

@Schema()
export class DeviceAuthSession {
    @Prop({ required: true })
    issuedAt: number

    @Prop({ required: true })
    expireDate: number

    @Prop({
        required: true,
        type: UserInfoSchema
    })
    userInfo: UserInfo

    @Prop({
        required: true,
        type: DeviceInfoSchema
    })
    deviceInfo: DeviceInfo
}

export const DeviceAuthSessionsSchema = SchemaFactory.createForClass<DeviceAuthSessionDBModel>(DeviceAuthSession)
