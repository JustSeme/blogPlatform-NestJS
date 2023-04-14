import { Injectable } from "@nestjs/common"
import { PassportStrategy } from '@nestjs/passport'
import {
    ExtractJwt, Strategy
} from "passport-jwt"
import { Settings } from "src/Settings"

const settings = new Settings()

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: settings.JWT_SECRET
        })
    }

    validate(payload: { userId: string }) {
        return payload
    }
}