import { v4 as uuidv4 } from 'uuid'
import jwt, { JwtPayload } from "jsonwebtoken"
import { Injectable } from "@nestjs/common"
import { JwtService } from '../../../general/adapters/jwt.adapter'
import { DeviceRepository } from '../../../security/infrastructure/device-db-repository'
import { AuthConfig } from '../../../configuration/auth.config'
import { DeviceAuthSessionDTO } from '../../../security/domain/DeviceAuthSessionType'

@Injectable()
export class LoginUseCase {
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

    async execute(userId: string, userIp: string, deviceName: string) {
        const deviceId = uuidv4()

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