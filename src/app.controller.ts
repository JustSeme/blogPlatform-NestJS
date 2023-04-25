import {
  Controller, Delete, Get, HttpCode, HttpStatus
} from '@nestjs/common'
import { AppService } from './app.service'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello()
  }

  @Delete('testing/all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTestingData(): Promise<number> {
    await this.appService.deleteTestingData()
    return
  }
}
