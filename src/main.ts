import cookieParser from "cookie-parser"
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { NestExpressApplication } from "@nestjs/platform-express"
import { settings } from "./settings"

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  app.use(cookieParser())
  app.set('trust proxy', true)
  app.enableCors({})
  await app.listen(settings.PORT)
}
bootstrap()
