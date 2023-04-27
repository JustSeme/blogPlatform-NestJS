import { ConfigService } from "@nestjs/config"
import { BaseConfig } from "./base.config"
import { Injectable } from "@nestjs/common/decorators"

@Injectable()
export class BlogsConfig extends BaseConfig {
    constructor(protected appConfigService: ConfigService) {
        super(appConfigService)
    }

    getSuperAdminData() {
        const SA_LOGIN = this.getString('SA_LOGIN')
        const SA_PASSWORD = this.getString('SA_PASSWORD')
        return {
            SA_PASSWORD,
            SA_LOGIN
        }
    }
}