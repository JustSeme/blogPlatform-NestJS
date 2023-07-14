import { ConfigService } from "@nestjs/config"

export class BaseConfig {
    constructor(
        protected appConfigService: ConfigService
    ) { }

    getNumber(key: string, defaultValue?: number) {
        const value = this.appConfigService.get(key)
        const parsedValue = Number(value)

        if (isNaN(parsedValue)) {
            if (defaultValue !== undefined) {
                return defaultValue
            } else {
                throw new Error(`Invalid configuration for ${key}: can't parse to number`)
            }
        }
        return parsedValue
    }

    getString(key: string, defaultValue?: string) {
        const value = this.appConfigService.get(key)

        if (!value) {
            if (defaultValue !== undefined) {
                return defaultValue
            } else {
                throw new Error(`Invalid configuration for ${key}: value is undefined`)
            }
        }
        return value
    }
}