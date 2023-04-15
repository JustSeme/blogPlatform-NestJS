import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { NestExpressApplication } from "@nestjs/platform-express"
import { ConfigService } from "@nestjs/config"
import { createApp } from "./createApp"

async function bootstrap() {
  const rawApp = await NestFactory.create<NestExpressApplication>(AppModule)
  const app = createApp(rawApp)
  const configService = app.get(ConfigService)
  const port = parseInt(configService.get('PORT'), 10)
  await app.listen(port)
}

bootstrap()
