import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { User } from './general/users/domain/UsersSchema'
import { UserModelType } from './general/users/domain/UsersTypes'
import { Post } from './blogs/domain/posts/PostsSchema'
import { PostModelType } from './blogs/domain/posts/PostsTypes'
import { Blog } from './blogs/domain/blogs/BlogsSchema'
import { BlogModelType } from './blogs/domain/blogs/BlogsTypes'
import { CommentModelType } from './blogs/domain/comments/CommentTypes'
import { Attempt } from './security/domain/AttemptsSchema'
import { AttemptModelType } from './security/domain/AttemptsType'
import { CommentEntity } from './blogs/domain/comments/CommentsSchema'

@Injectable()
export class AppService {
  constructor(
    @InjectModel(User.name) private UsersModel: UserModelType,
    @InjectModel(Post.name) protected PostModel: PostModelType,
    @InjectModel(Blog.name) protected BlogModel: BlogModelType,
    @InjectModel(CommentEntity.name) protected CommentModel: CommentModelType,
    @InjectModel(Attempt.name) protected AttemptsModel: AttemptModelType
  ) { }

  getHello(): string {
    return `
      <h1>Привет! Это мой учебный проект по бэкенду</h1>
      <h2>Я пока не реализовал способ демонстриации работы моего API, но позже обязательно это сделаю.</h2>
      <h2>Оцените качество моей работы на <a href='https://github.com/JustSeme/homeworks'>гитхабе</a>. Так же чтобы проверить работу можно e2e тестами, реализованными в проекте</h2>
    `
  }

  async deleteTestingData() {
    await this.PostModel.deleteMany({})
    await this.BlogModel.deleteMany({})
    await this.UsersModel.deleteMany({})
    await this.CommentModel.deleteMany({})
    await this.AttemptsModel.deleteMany({})
  }
}
