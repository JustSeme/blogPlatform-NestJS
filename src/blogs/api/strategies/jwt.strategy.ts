import { Injectable } from "@nestjs/common"
import { PassportStrategy } from '@nestjs/passport'
import {
    ExtractJwt, Strategy
} from "passport-jwt"
import { settings } from "src/settings"

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: settings.JWT_SECRET
        })
    }

    async validate(payload: { accessToken: string }) {
        return payload
    }
}