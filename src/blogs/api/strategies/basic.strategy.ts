import {
    Injectable, UnauthorizedException
} from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { BasicStrategy as Strategy } from 'passport-http'
import { generateErrorsMessages } from "src/general/helpers"
import { Settings } from "src/Settings"

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
    settings: any
    constructor() {
        super()
        this.settings = new Settings()
    }

    validate(login: string, password: string) {
        if (login === this.settings.SA_LOGIN && password === this.settings.SA_PASSWORD) {
            return true
        }
        throw new UnauthorizedException(generateErrorsMessages('Super Admin logs is incorrect', 'authorization headers'))
    }
}