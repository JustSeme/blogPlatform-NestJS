import {
    Prop, Schema, SchemaFactory
} from '@nestjs/mongoose'
import { DeviceInfoType } from './DeviceSessionsType'

@Schema()
export class DeviceInfo {
    @Prop({ required: true })
    deviceId: string

    @Prop({ required: true })
    deviceName: string
}

export const DeviceInfoSchema = SchemaFactory.createForClass<DeviceInfoType>(DeviceInfo)
