import { Injectable } from "@nestjs/common"
import {
    InjectDataSource, InjectRepository
} from "@nestjs/typeorm"
import {
    DataSource,
    EntityManager, Repository
} from "typeorm"
import { BlogsEntitiesType } from "../BlogsTypes"
import { BansUsersForBlogs } from "../../../domain/blogs/typeORM/bans-users-for-blogs.entity"
import { BlogEntity } from "../../../domain/blogs/typeORM/blog.entity"

@Injectable()
export class BlogsTypeORMRepository {
    constructor(
        @InjectRepository(BlogEntity)
        private blogsRepository: Repository<BlogEntity>,
        @InjectRepository(BansUsersForBlogs)
        private bansUsersForBlogsRepository: Repository<BansUsersForBlogs>,
        @InjectDataSource() private dataSource: DataSource,
    ) { }

    async queryRunnerSave(
        entity: BlogsEntitiesType,
        queryRunnerManager: EntityManager
    ): Promise<BlogsEntitiesType> {
        return queryRunnerManager.save(entity)
    }

    async dataSourceSave(
        entity: BlogsEntitiesType
    ): Promise<BlogsEntitiesType> {
        return this.dataSource.manager.save(entity)
    }

    async removeBanUserForBlog(banEntity: BansUsersForBlogs): Promise<boolean> {
        try {
            await this.bansUsersForBlogsRepository.remove(banEntity)
            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async deleteBlog(id: string): Promise<boolean> {
        try {
            await this.blogsRepository.delete({ id: id })
            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }
}