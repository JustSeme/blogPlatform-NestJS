import {
    Injectable, UnauthorizedException
} from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { BasicStrategy as Strategy } from 'passport-http'
import { ConfigService } from '@nestjs/config'
import { generateErrorsMessages } from "../../../general/helpers"
import { ConfigType } from "../../../configuration/configuration"

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
    private superAdminSettings: {
        SA_LOGIN: string,
        SA_PASSWORD: string
    }
    constructor(private configService: ConfigService<ConfigType>) {
        super()
        this.superAdminSettings = this.configService.get('superAdmin')
    }

    validate(login: string, password: string) {
        if (login === this.superAdminSettings.SA_LOGIN && password === this.superAdminSettings.SA_PASSWORD) {
            return true
        }
        throw new UnauthorizedException(generateErrorsMessages('Super Admin logs is incorrect', 'authorization headers'))
    }
}