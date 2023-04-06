import {
  Controller, Delete, Get, HttpCode
} from '@nestjs/common'
import { AppService } from './app.service'
import { HTTP_STATUSES } from './settings'

@Controller('')
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello()
  }

  @Delete('testing/all-data')
  @HttpCode(HTTP_STATUSES.NO_CONTENT_204)
  async deleteTestingData(): Promise<number> {
    await this.appService.deleteTestingData()
    return
  }
}
