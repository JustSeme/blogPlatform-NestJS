import { SecurityService } from "../application/security-service"
import { DeviceSessionsViewModel } from "../application/dto/DeviceSessionsViewModel"
import {
    Controller,
    Delete, Get, HttpCode, Param, UseGuards
} from "@nestjs/common"
import { CurrentDeviceId } from "./decorators/current-deviceId.param.decorator"
import { IsDeviceExistsPipe } from "./pipes/isDeviceExists.validation.pipe"
import { RefreshAuthGuard } from "./guards/refresh-auth.guard"
import { JwtService } from "../../general/adapters/jwt.adapter"
import { CurrentUserId } from "../../general/decorators/current-userId.param.decorator"
import { HttpStatus } from '@nestjs/common'
import { CommandBus } from "@nestjs/cqrs"
import { RemoveAllSessionsExcludeCurrentCommand } from "../application/use-cases/remove-all-sessions-exclude-current.use-case"
import { DeleteDeviceCommand } from "../application/use-cases/delete-device.use-case"
import { GetActiveDevicesCommand } from "../application/use-cases/get-active-devices-for-user.use-case"

@Controller('security')
@UseGuards(RefreshAuthGuard)
export class SecurityController {
    constructor(
        protected jwtService: JwtService,
        protected securityService: SecurityService,
        protected commandBus: CommandBus,
    ) { }

    @Get('devices')
    async getDevices(
        @CurrentUserId() userId: string
    ): Promise<DeviceSessionsViewModel[]> {
        const activeDevicesForUser = await this.commandBus.execute(
            new GetActiveDevicesCommand(userId)
        )

        return activeDevicesForUser
    }

    @Delete('devices')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteDevices(
        @CurrentUserId() userId: string,
        @CurrentDeviceId() deviceId: string
    ) { // exclude current
        await this.commandBus.execute(
            new RemoveAllSessionsExcludeCurrentCommand(userId, deviceId)
        )
    }

    @Delete('devices/:deviceId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteDeviceById(
        @Param('deviceId', IsDeviceExistsPipe) deviceId: string,
        @CurrentUserId() userId: string
    ) {
        await this.commandBus.execute(
            new DeleteDeviceCommand(deviceId, userId)
        )
    }
}