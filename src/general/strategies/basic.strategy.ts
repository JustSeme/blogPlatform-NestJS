import {
    Injectable, UnauthorizedException
} from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { BasicStrategy as Strategy } from 'passport-http'
import { generateErrorsMessages } from "../helpers/helpers"
import { BlogsConfig } from "../../configuration/blogs.config"

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
    private superAdminSettings: {
        SA_LOGIN: string,
        SA_PASSWORD: string
    }
    constructor(private blogsConfig: BlogsConfig) {
        super()
        this.superAdminSettings = this.blogsConfig.getSuperAdminData()
    }

    validate(login: string, password: string) {
        if (login === this.superAdminSettings.SA_LOGIN && password === this.superAdminSettings.SA_PASSWORD) {
            return true
        }
        throw new UnauthorizedException(generateErrorsMessages('Super Admin logs is incorrect', 'authorization headers'))
    }
}