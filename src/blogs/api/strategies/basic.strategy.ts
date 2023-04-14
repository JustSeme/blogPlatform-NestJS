import {
    Injectable, UnauthorizedException
} from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { BasicStrategy as Strategy } from 'passport-http'
import { ConfigService } from '@nestjs/config'
import { generateErrorsMessages } from "../../../general/helpers"

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
    private superAdminLogin: string
    private superAdminPassword: string
    constructor(private configService: ConfigService) {
        super()
        this.superAdminLogin = this.configService.get('SA_LOGIN')
        this.superAdminPassword = this.configService.get('SA_PASSWORD')
    }

    validate(login: string, password: string) {
        if (login === this.superAdminLogin && password === this.superAdminPassword) {
            return true
        }
        throw new UnauthorizedException(generateErrorsMessages('Super Admin logs is incorrect', 'authorization headers'))
    }
}