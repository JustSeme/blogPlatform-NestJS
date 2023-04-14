import cookieParser from "cookie-parser"
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { NestExpressApplication } from "@nestjs/platform-express"
import {
  BadRequestException, ValidationPipe
} from "@nestjs/common"
import {
  ErrorExceptionFilter, HttpExceptionFilter
} from "./exception.filter"
import { FieldError } from "./general/types/ErrorMessagesOutputModel"
import { useContainer } from "class-validator"
import { ConfigService } from "@nestjs/config"

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


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  const configService = app.get(ConfigService)
  const port = parseInt(configService.get('PORT'), 10)
  useContainer(app.select(AppModule), { fallbackOnErrors: true })

  app.use(cookieParser())
  app.set('trust proxy', true)

  app.enableCors({})

  app.useGlobalPipes(new ValidationPipe({
    stopAtFirstError: false,
    exceptionFactory: customExceptionFactory
  }))
  app.useGlobalFilters(new ErrorExceptionFilter(), new HttpExceptionFilter())

  await app.listen(port)
}

bootstrap()
