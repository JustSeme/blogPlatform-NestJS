import jwt, { JwtPayload } from 'jsonwebtoken'
import { Injectable } from '@nestjs/common/decorators'
import { ConfigService } from '@nestjs/config'
import { DeviceRepository } from '../../security/infrastructure/device-db-repository'


@Injectable()
export class JwtService {
    private jwtSecret: string
    private accessTokenExpireTime: string
    private refreshTokenExpireTime: string

    constructor(
        protected deviceRepository: DeviceRepository,
        private readonly configService: ConfigService
    ) {
        this.jwtSecret = this.configService.get('JWT_SECRET')
        this.accessTokenExpireTime = this.configService.get('ACCESS_TOKEN_EXPIRE_TIME')
        this.refreshTokenExpireTime = this.configService.get('REFRESH_TOKEN_EXPIRE_TIME')
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
            if (issuedAtForDeviceId > result.iat) {
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

        const newRefreshToken = await this.createRefreshToken(this.refreshTokenExpireTime, result.deviceId, result.userId)
        const newAccessToken = await this.createAccessToken(this.accessTokenExpireTime, result.userId)
        const resultOfCreatedToken = jwt.decode(newRefreshToken) as JwtPayload

        const isUpdated = this.deviceRepository.updateSession(result.deviceId, resultOfCreatedToken.iat, resultOfCreatedToken.exp)

        if (!isUpdated) {
            return null
        }

        return {
            newRefreshToken,
            newAccessToken
        }
    }
}