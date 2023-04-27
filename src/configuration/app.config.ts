import { ConfigService } from "@nestjs/config"
import { BaseConfig } from "./base.config"
import { Injectable } from "@nestjs/common"

@Injectable()
export class AppConfig extends BaseConfig {
    constructor(protected appConfigService: ConfigService) {
        super(appConfigService)
    }

    getPort() {
        return this.getNumber('PORT', 3000)
    }

    getDBConnectionString() {
        return this.getString('mongoURI')
    }
}