import { Injectable } from "@nestjs/common"
import {
    InjectDataSource, InjectRepository
} from "@nestjs/typeorm"
import { CommentEntity } from "../../../domain/comments/typeORM/comment.entity"
import {
    DataSource, EntityManager, Repository
} from "typeorm"
import { CommentEntitiesType } from "../CommentsTypes"

@Injectable()
export class CommentsTypeORMRepository {
    constructor(
        @InjectRepository(CommentEntity)
        private commentsRepository: Repository<CommentEntity>,
        @InjectDataSource() private dataSource: DataSource
    ) { }

    async queryRunnerSave(
        entity: CommentEntitiesType,
        queryRunnerManager: EntityManager
    ): Promise<CommentEntitiesType> {
        return queryRunnerManager.save(entity)
    }

    async dataSourceSave(
        entity: CommentEntitiesType
    ): Promise<CommentEntitiesType> {
        return this.dataSource.manager.save(entity)
    }
}