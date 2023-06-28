import { Injectable } from "@nestjs/common"
import {
    InjectDataSource, InjectRepository
} from "@nestjs/typeorm"
import { BlogEntity } from "../../../domain/blogs/blog.entity"
import {
    DataSource,
    EntityManager, Repository
} from "typeorm"
import { BlogsEntitiesType } from "../BlogsTypes"

@Injectable()
export class BlogsTypeORMRepository {
    constructor(
        @InjectRepository(BlogEntity)
        private blogsRepository: Repository<BlogEntity>,
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
}