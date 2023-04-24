import { ConfigModule } from "@nestjs/config"
import { envFilePath } from "./detect-env"
import * as Joi from "joi"

const configModuleValidation = Joi.object({
    NODE_ENV: Joi.string()
        .valid('development', 'production', 'testing')
        .default('development'),
    PORT: Joi.number().default(3000),
    JWT_SECRET: Joi.string().required(),
    mongoURI: Joi.string().uri().required(),
    tokens: Joi.object({
        ACCESS_TOKEN_EXPIRE_TIME: Joi.string().default('10s').required(),
        REFRESH_TOKEN_EXPIRE_TIME: Joi.string().default('20s').required(),
    }),
    gmail: Joi.object({
        GMAIL_LOGIN: Joi.string().required(),
        GMAIL_APP_PASSWORD: Joi.string().required()
    }),
    superAdmin: Joi.object({
        SA_LOGIN: Joi.string().required(),
        SA_PASSWORD: Joi.string().required()
    })
})

export const configModule = ConfigModule.forRoot({
    isGlobal: true,
    cache: true,
    envFilePath: envFilePath,
    validationSchema: configModuleValidation
})