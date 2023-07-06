import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Post } from './Blogger/domain/posts/mongoose/PostsSchema'
import { PostModelType } from './Blogger/domain/posts/PostsTypes'
import { Blog } from './Blogger/domain/blogs/mongoose/BlogsSchema'
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
    CREATE OR REPLACE FUNCTION f_truncate_tables(_username text)
  RETURNS void
  LANGUAGE plpgsql AS
$func$
DECLARE
  _tbl text;
  _sch text;
BEGIN
    FOR _sch, _tbl IN 
      SELECT schemaname, tablename
      FROM   pg_tables
      WHERE  tableowner = _username
      AND    schemaname = 'public'
  LOOP
      -- dangerous, test before you execute!
      RAISE NOTICE '%',  -- once confident, comment this line ...
      -- EXECUTE         -- ... and uncomment this one
        format('TRUNCATE TABLE %I.%I CASCADE', _sch, _tbl);
  END LOOP;
END
$func$;

SELECT truncate_tables('JustSeme')
      `)
  }
}
