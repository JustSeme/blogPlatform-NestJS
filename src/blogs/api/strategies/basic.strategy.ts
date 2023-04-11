import {
    Injectable, UnauthorizedException
} from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { BasicStrategy as Strategy } from 'passport-http'
import { settings } from "src/settings"

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super()
    }

    validate(login: string, password: string) {
        if (login === settings.SA_LOGIN && password === settings.SA_PASSWORD) {
            return true
        }
        throw new UnauthorizedException('Super Admin logs is incorrect')
    }
}