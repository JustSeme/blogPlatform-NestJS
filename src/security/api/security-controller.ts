import { SecurityService } from "../application/security-service"
import { DeviceSessionsViewModel } from "../application/dto/DeviceSessionsViewModel"
import {
    Controller,
    Delete,
    ForbiddenException, Get, NotFoundException, NotImplementedException, Param, UseGuards
} from "@nestjs/common"
import { CurrentDeviceId } from "../current-deviceId.param.decorator"
import { IsDeviceExistsPipe } from "./pipes/isDeviceExists.validation.pipe"
import { RefreshAuthGuard } from "./guards/refresh-auth.guard"
import { JwtService } from "../../general/adapters/JwtService"
import { CurrentUserId } from "../../general/decorators/current-userId.param.decorator"
import { generateErrorsMessages } from "../../general/helpers"

@Controller('security')
@UseGuards(RefreshAuthGuard)
export class SecurityController {
    constructor(protected jwtService: JwtService, protected securityService: SecurityService) { }

    @Get('devices')
    async getDevices(@CurrentUserId() userId: string): Promise<DeviceSessionsViewModel[]> {
        const activeDevicesForUser = await this.securityService.getActiveDevicesForUser(userId)
        if (!activeDevicesForUser) {
            throw new NotFoundException(generateErrorsMessages('Active devices is not found', 'none'))
        }

        return activeDevicesForUser
    }

    @Delete('devices')
    async deleteDevices(@CurrentUserId() userId: string, @CurrentDeviceId() deviceId: string) { // exclude current
        const isDeleted = await this.securityService.removeAllSessions(userId, deviceId) // exclude current
        if (!isDeleted) {
            throw new NotImplementedException('Device is wasn\'t deleted')
        }

        return
    }

    @Delete('devices/:deviceId')
    async deleteDeviceById(@Param('deviceId', IsDeviceExistsPipe) deviceId: string, @CurrentUserId() userId: string) {
        const deletingDevice = await this.securityService.getDeviceById(deviceId)

        if (userId !== deletingDevice.userInfo.userId) {
            throw new ForbiddenException(generateErrorsMessages('That is not your own', 'userId'))
        }

        await this.securityService.deleteDevice(deviceId)

        return
    }
}