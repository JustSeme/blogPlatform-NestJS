import cookieParser from "cookie-parser"
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { NestExpressApplication } from "@nestjs/platform-express"
import { settings } from "./settings"
import {
  BadRequestException, ValidationPipe
} from "@nestjs/common"
import { HttpExceptionFilter } from "./exception.filter"
import { FieldError } from "./types/ErrorMessagesOutputModel"

const customExceptionFactory = (errors) => {
  const errorsArray = []
  errors.forEach((e) => {
    const displayedError: FieldError = {
      field: e.property,
      message: ''
    }
    const constrainsKeys = Object.keys(e.constraints)
    constrainsKeys.forEach(ckey => {
      displayedError.message = displayedError.message + '; ' + e.constraints[ckey]
    })
    errorsArray.push(displayedError)
  })
  throw new BadRequestException(errorsArray)
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  app.use(cookieParser())
  app.set('trust proxy', true)

  app.enableCors({})

  app.useGlobalPipes(new ValidationPipe({
    stopAtFirstError: false,
    exceptionFactory: customExceptionFactory
  }))
  app.useGlobalFilters(new HttpExceptionFilter())

  await app.listen(settings.PORT)
}
bootstrap()
