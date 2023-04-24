import { ConfigModule } from "@nestjs/config"
import { envFilePath } from "./detect-env"
import { getConfiguration } from "./configuration"

export const configModule = ConfigModule.forRoot({
    envFilePath: envFilePath,
    isGlobal: true,
    load: [getConfiguration]
})