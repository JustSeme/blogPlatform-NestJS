import {
    BadRequestException, ValidationPipe
} from "@nestjs/common"
import {
    ErrorExceptionFilter, HttpExceptionFilter
} from "./exception.filter"
import cookieParser from "cookie-parser"
import { useContainer } from "class-validator"
import { AppModule } from "./app.module"
import { FieldError } from "./general/types/ErrorMessagesOutputModel"
import { NestExpressApplication } from "@nestjs/platform-express"

const customExceptionFactory = (errors) => {
    const errorsArray = []
    errors.forEach((e) => {
        const displayedError: FieldError = {
            field: e.property,
            message: ''
        }
        const constrainsKeys = Object.keys(e.constraints)
        constrainsKeys.forEach((ckey, index) => {
            if (index === 0) {
                displayedError.message = e.constraints[ckey]
            } else {
                displayedError.message = displayedError.message + '; ' + e.constraints[ckey]
            }
        })
        errorsArray.push(displayedError)
    })
    throw new BadRequestException(errorsArray)
}

export const createApp = (app: NestExpressApplication): NestExpressApplication => {
    useContainer(app.select(AppModule), { fallbackOnErrors: true })

    app.use(cookieParser())
    app.set('trust proxy', true)

    app.enableCors({})

    app.useGlobalPipes(new ValidationPipe({
        stopAtFirstError: false,
        exceptionFactory: customExceptionFactory
    }))
    app.useGlobalFilters(new ErrorExceptionFilter(), new HttpExceptionFilter())
    return app
}