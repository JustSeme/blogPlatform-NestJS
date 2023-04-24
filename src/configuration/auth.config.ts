import { ConfigService } from "@nestjs/config"
import { BaseConfig } from "./baseConfig"
import { Injectable } from "@nestjs/common"

@Injectable()
export class AuthConfig extends BaseConfig {
    constructor(protected appConfigService: ConfigService) {
        super(appConfigService)
    }

    getTokensSettings() {
        const ACCESS_TOKEN_EXPIRE_TIME = this.getString('ACCESS_TOKEN_EXPIRE_TIME')
        const REFRESH_TOKEN_EXPIRE_TIME = this.getString('REFRESH_TOKEN_EXPIRE_TIME')
        return {
            ACCESS_TOKEN_EXPIRE_TIME,
            REFRESH_TOKEN_EXPIRE_TIME
        }
    }

    getJwtSecret() {
        return this.getString('JWT_SECRET')
    }
}