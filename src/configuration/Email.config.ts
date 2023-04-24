import { ConfigService } from "@nestjs/config"
import { BaseConfig } from "./baseConfig"
import { Injectable } from "@nestjs/common"

@Injectable()
export class EmailConfig extends BaseConfig {
    constructor(protected appConfigService: ConfigService) {
        super(appConfigService)
    }

    getGmailData() {
        const GMAIL_LOGIN = this.getString('GMAIL_LOGIN')
        const GMAIL_APP_PASSWORD = this.getString('GMAIL_APP_PASSWORD')

        return {
            GMAIL_APP_PASSWORD,
            GMAIL_LOGIN
        }
    }
}