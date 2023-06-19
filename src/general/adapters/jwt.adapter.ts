import jwt, { JwtPayload } from 'jsonwebtoken'
import { Injectable } from '@nestjs/common/decorators'
import { AuthConfig } from '../../configuration/auth.config'
import { DevicesSQLRepository } from '../../security/infrastructure/devices-sql-repository'


@Injectable()
export class JwtService {
    private jwtSecret: string
    private tokensSettings: {
        ACCESS_TOKEN_EXPIRE_TIME: string,
        REFRESH_TOKEN_EXPIRE_TIME: string,
    }

    constructor(
        protected deviceRepository: DevicesSQLRepository,
        private readonly authConfig: AuthConfig
    ) {
        this.jwtSecret = this.authConfig.getJwtSecret()
        this.tokensSettings = this.authConfig.getTokensSettings()
    }

    async createAccessToken(expiresTime: string | number, userId: string) {
        return jwt.sign({ userId }, this.jwtSecret, { expiresIn: expiresTime })
    }

    async createRefreshToken(expiresTime: string | number, deviceId: string, userId: string) {
        return jwt.sign({
            deviceId, userId
        }, this.jwtSecret, { expiresIn: expiresTime })
    }

    async getUserIdByToken(token: string) {
        try {
            const result = await jwt.verify(token, this.jwtSecret) as JwtPayload
            return result.userId
        } catch (err) {
            return null
        }
    }

    async verifyRefreshToken(verifiedToken: string) {
        try {
            const result = await jwt.verify(verifiedToken, this.jwtSecret) as JwtPayload
            const issuedAtForDeviceId = await this.deviceRepository.getCurrentIssuedAt(result.deviceId)

            if (issuedAtForDeviceId > result.iat || !issuedAtForDeviceId) {
                return null
            }

            return result
        } catch (err) {
            return null
        }
    }

    async verifyAccessToken(verifiedToken: string) {
        try {
            const result = await jwt.verify(verifiedToken, this.jwtSecret) as JwtPayload
            return result
        } catch (err) {
            return null
        }
    }

    async refreshTokens(verifiedToken: string) {
        const result = await this.verifyRefreshToken(verifiedToken)
        if (!result) {
            return null
        }

        const newRefreshToken = await this.createRefreshToken(this.tokensSettings.REFRESH_TOKEN_EXPIRE_TIME, result.deviceId, result.userId)
        const newAccessToken = await this.createAccessToken(this.tokensSettings.ACCESS_TOKEN_EXPIRE_TIME, result.userId)
        const resultOfCreatedToken = jwt.decode(newRefreshToken) as JwtPayload

        const isUpdated = await this.deviceRepository.updateSession(result.deviceId, resultOfCreatedToken.iat, resultOfCreatedToken.exp)

        if (!isUpdated) {
            return null
        }

        return {
            newRefreshToken,
            newAccessToken
        }
    }

    async getCorrectUserIdByAccessToken(accessToken: string | null): Promise<string | null> {
        if (accessToken) {
            const jwtResult = await this.verifyAccessToken(accessToken)
            return jwtResult ? jwtResult.userId : null
        }
    }
}