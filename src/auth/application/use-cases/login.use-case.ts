import { v4 as uuidv4 } from 'uuid'
import jwt, { JwtPayload } from "jsonwebtoken"
import { Injectable } from "@nestjs/common"
import { JwtService } from '../../../general/adapters/jwt.adapter'
import { DeviceRepository } from '../../../security/infrastructure/device-db-repository'
import { AuthConfig } from '../../../configuration/auth.config'
import { DeviceAuthSessionDTO } from '../../../security/domain/DeviceAuthSessionType'
import { ICommandHandler } from '@nestjs/cqrs'

export class LoginCommand {
    constructor(
        public readonly userId: string,
        public readonly userIp: string,
        public readonly deviceName: string
    ) { }
}

@Injectable()
export class LoginUseCase implements ICommandHandler<LoginCommand> {
    private tokensSettings: {
        ACCESS_TOKEN_EXPIRE_TIME: string,
        REFRESH_TOKEN_EXPIRE_TIME: string,
    }

    constructor(
        private jwtService: JwtService,
        private deviceRepository: DeviceRepository,
        private readonly authConfig: AuthConfig,
    ) {
        this.tokensSettings = this.authConfig.getTokensSettings()
    }

    async execute(command: LoginCommand) {
        const deviceId = uuidv4()
        const {
            userId,
            userIp,
            deviceName
        } = command

        const accessToken = await this.jwtService.createAccessToken(this.tokensSettings.ACCESS_TOKEN_EXPIRE_TIME, userId)
        const refreshToken = await this.jwtService.createRefreshToken(this.tokensSettings.REFRESH_TOKEN_EXPIRE_TIME, deviceId, userId)
        const result = await jwt.decode(refreshToken) as JwtPayload

        const newSession = new DeviceAuthSessionDTO(result.iat, result.exp, userId, userIp, deviceId, deviceName)

        const isAdded = await this.deviceRepository.addSession(newSession)
        if (!isAdded) {
            return null
        }

        return {
            accessToken,
            refreshToken
        }
    }
}