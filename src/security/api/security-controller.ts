import { SecurityService } from "../application/security-service"
import { DeviceSessionsViewModel } from "../application/dto/DeviceSessionsViewModel"
import {
    Controller,
    Delete,
    ForbiddenException, Get, NotFoundException, NotImplementedException, Param, UseGuards
} from "@nestjs/common"
import { JwtService } from "src/general/adapters/jwtService"
import { RefreshJwtAuthGuard } from "./guards/refresh-jwt-auth.guard"
import { CurrentUserId } from "src/general/decorators/current-userId.param.decorator"
import { generateErrorsMessages } from "src/helpers"
import { CurrentDeviceId } from "../current-deviceId.param.decorator"

@Controller('security')
@UseGuards(RefreshJwtAuthGuard)
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
    async deleteDevices(@CurrentUserId() userId: string, @CurrentDeviceId() deviceId: string): Promise<boolean> { // exclude current
        const isDeleted = await this.securityService.removeAllSessions(userId, deviceId) // exclude current
        if (!isDeleted) {
            throw new NotImplementedException('Device is wasn\'t deleted')
        }

        return true
    }

    @Delete('devices/:deviceId')
    async deleteDeviceById(@Param('deviceId') deviceId: string, @CurrentUserId() userId: string): Promise<boolean> {
        const deletingDevice = await this.securityService.getDeviceById(deviceId)

        if (!deletingDevice) {
            throw new NotFoundException(generateErrorsMessages('Deleting device is not found', 'deviceId'))
        }

        if (userId !== deletingDevice.userInfo.userId) {
            throw new ForbiddenException(generateErrorsMessages('That is not your own', 'userId'))
        }

        await this.securityService.deleteDevice(deviceId)

        return true
    }
}