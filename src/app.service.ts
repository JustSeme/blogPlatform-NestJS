import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Post } from './Blogger/domain/posts/mongoose/PostsSchema'
import { PostModelType } from './Blogger/domain/posts/PostsTypes'
import { Blog } from './Blogger/domain/blogs/BlogsSchema'
import { BlogModelType } from './Blogger/domain/blogs/BlogsTypes'
import { CommentModelType } from './blogs/domain/comments/CommentTypes'
import { Attempt } from './security/domain/AttemptsSchema'
import { AttemptModelType } from './security/domain/AttemptsType'
import { Comment } from './blogs/domain/comments/mongoose/Comments.schema'
import { UserModelType } from './SuperAdmin/domain/UsersTypes'
import { User } from './SuperAdmin/domain/mongoose/UsersSchema'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'

@Injectable()
export class AppService {
  constructor(
    @InjectModel(User.name) private UsersModel: UserModelType,
    @InjectModel(Post.name) protected PostModel: PostModelType,
    @InjectModel(Blog.name) protected BlogModel: BlogModelType,
    @InjectModel(Comment.name) protected CommentModel: CommentModelType,
    @InjectModel(Attempt.name) protected AttemptsModel: AttemptModelType,
    @InjectDataSource() protected dataSource: DataSource
  ) { }

  getHello(): string {
    return `
      <h1>Привет! Это мой учебный проект по бэкенду</h1>
      <h2>Я пока не реализовал способ демонстриации работы моего API, но позже обязательно это сделаю.</h2>
      <h2>Оцените качество моей работы на <a href='https://github.com/JustSeme/homeworks'>гитхабе</a>. Так же проверить работу можно e2e тестами, реализованными в проекте</h2>
    `
  }

  async deleteTestingData() {
    await this.PostModel.deleteMany({})
    await this.BlogModel.deleteMany({})
    await this.UsersModel.deleteMany({})
    await this.CommentModel.deleteMany({})
    await this.AttemptsModel.deleteMany({})
  }

  async clearSQLTables() {
    await this.dataSource.query(`
      DELETE FROM public."auth_session"
        WHERE 1 = 1;

      DELETE FROM public."bans_users_for_blogs"
        WHERE 1 = 1;

      DELETE FROM public."comment_likes_info"
        WHERE 1 = 1;

      DELETE FROM public."comment_entity"
        WHERE 1 = 1;

      DELETE FROM public."post_entity"
        WHERE 1 = 1;
      
      DELETE FROM public."blog_entity"
        WHERE 1 = 1;

      DELETE FROM public."user_ban_info"
        WHERE 1 = 1;

      DELETE FROM public."user_email_confirmation"
        WHERE 1 = 1;

      DELETE FROM public."user_password_recovery"
        WHERE 1 = 1;

      DELETE FROM public."user_entity"
        WHERE 1 = 1;

      DELETE FROM public."attempt_entity"
        WHERE 1 = 1;
      `)
  }
}
