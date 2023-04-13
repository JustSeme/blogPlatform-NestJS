import { Injectable } from "@nestjs/common"
import { PassportStrategy } from '@nestjs/passport'
import {
    ExtractJwt, Strategy
} from "passport-jwt"
import { DeviceRepository } from "src/security/infrastructure/device-db-repository"
import { settings } from "src/settings"

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(Strategy, 'refreshJwt') {
    constructor(private deviceRepository: DeviceRepository) {
        super({
            jwtFromRequest: ExtractJwt.fromHeader('Cookie'),
            ignoreExpiration: false,
            secretOrKey: settings.JWT_SECRET
        })
    }

    async validate(payload: { userId: string, deviceId: string, iat: number }) {
        const issuedAtForDeviceId = await this.deviceRepository.getCurrentIssuedAt(payload.deviceId)
        if (issuedAtForDeviceId > payload.iat) {
            return null
        }
        return payload
    }
}