import { Injectable } from "@nestjs/common"
import {
    InjectDataSource, InjectRepository
} from "@nestjs/typeorm"
import { Question } from "../domain/question.entity"
import {
    DataSource,
    EntityManager, Repository
} from "typeorm"
import { QuizEntitiesType } from "./QuizTypes"

@Injectable()
export class QuizRepository {
    constructor(
        @InjectRepository(Question)
        private questionsRepository: Repository<Question>,
        @InjectDataSource() private dataSource: DataSource,
    ) { }

    async queryRunnerSave(
        entity: QuizEntitiesType,
        queryRunnerManager: EntityManager
    ): Promise<QuizEntitiesType> {
        try {
            return queryRunnerManager.save(entity)
        } catch (err) {
            console.error(err)
            return null
        }
    }

    async dataSourceSave(
        entity: QuizEntitiesType
    ): Promise<QuizEntitiesType> {
        try {
            return this.dataSource.manager.save(entity)
        } catch (err) {
            console.error(err)
            return null
        }
    }

    async removeEntity(
        entity: QuizEntitiesType
    ): Promise<boolean> {
        try {
            const deleteResult = await this.dataSource.manager.remove(entity)

            return deleteResult ? true : false
        } catch (err) {
            console.error(err)
            return false
        }
    }
}