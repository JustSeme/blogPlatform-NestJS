import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { User } from './auth/domain/UsersSchema'
import { UserModelType } from './auth/domain/UsersTypes'

@Injectable()
export class AppService {
  constructor(@InjectModel(User.name) private UsersModel: UserModelType) { }

  getHello(): string {
    return `
      <h1>Привет! Это мой учебный проект по бэкенду</h1>
      <h2>Я пока не реализовал способ демонстриации работы моего API, но позже обязательно это сделаю.</h2>
      <h2>Оцените качество моей работы на <a href='https://github.com/JustSeme/homeworks'>гитхабе</a>. Так же чтобы проверить работу можно e2e тестами, реализованными в проекте</h2>
    `
  }

  async deleteTestingData() {
    //await PostsModel.deleteMany({})
    //await BlogsModel.deleteMany({})
    await this.UsersModel.deleteMany({})
    //await AttemptsModel.deleteMany({})
  }
}
