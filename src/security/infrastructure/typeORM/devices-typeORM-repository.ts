import { Injectable } from "@nestjs/common"
import {
    InjectDataSource, InjectRepository
} from "@nestjs/typeorm"
import { AuthSession } from "../../domain/typeORM/auth-session.entity"
import {
    DataSource,
    EntityManager, Repository
} from "typeorm"

@Injectable()
export class DevicesTypeORMRepository {
    constructor(
        @InjectRepository(AuthSession)
        private authSessionsRepository: Repository<AuthSession>,
        @InjectDataSource() private dataSource: DataSource,
    ) { }

    async queryRunnerSave(
        entity: AuthSession,
        queryRunnerManager: EntityManager
    ): Promise<AuthSession> {
        return queryRunnerManager.save(entity)
    }

    async dataSourceSave(
        entity: AuthSession
    ): Promise<AuthSession> {
        return this.dataSource.manager.save(entity)
    }
}   