import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { NestExpressApplication } from "@nestjs/platform-express"
import { createApp } from "./createApp"
import { AppConfig } from './configuration/app.config'

async function bootstrap() {
  const rawApp = await NestFactory.create<NestExpressApplication>(AppModule)
  const app = createApp(rawApp)
  const appConfigService = app.get(AppConfig)
  const port = appConfigService.getPort()
  await app.listen(port)
}

bootstrap()
