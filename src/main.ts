import cookieParser from "cookie-parser"
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { NestExpressApplication } from "@nestjs/platform-express"
import { Settings } from "./Settings"
import {
  BadRequestException, ValidationPipe
} from "@nestjs/common"
import {
  ErrorExceptionFilter, HttpExceptionFilter
} from "./exception.filter"
import { FieldError } from "./general/types/ErrorMessagesOutputModel"
import { useContainer } from "class-validator"

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

const settings = new Settings()

export let app: any
async function bootstrap() {
  app = await NestFactory.create<NestExpressApplication>(AppModule)

  useContainer(app.select(AppModule), { fallbackOnErrors: true })

  app.use(cookieParser())
  app.set('trust proxy', true)

  app.enableCors({})

  app.useGlobalPipes(new ValidationPipe({
    stopAtFirstError: false,
    exceptionFactory: customExceptionFactory
  }))
  app.useGlobalFilters(new ErrorExceptionFilter(), new HttpExceptionFilter())

  await app.listen(settings.PORT)
}

bootstrap()
