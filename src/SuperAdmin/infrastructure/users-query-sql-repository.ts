import { Injectable } from "@nestjs/common/decorators"
import { DataSource } from "typeorm"
import {
    UserViewModelType, UsersWithQueryOutputModel
} from "../application/dto/UsersViewModel"
import { UserSQLModel } from "./UsersTypes"
import { ReadUsersQuery } from "../api/models/ReadUsersQuery"

@Injectable()
export class UsersQuerySQLRepository {
    constructor(
        private dataSource: DataSource
    ) { }

    async findUsers(queryParams: ReadUsersQuery): Promise<UsersWithQueryOutputModel> {
        const {
            sortDirection = 'desc', sortBy = 'createdAt', pageNumber = 1, pageSize = 10, searchLoginTerm = '', searchEmailTerm = '', banStatus = 'all'
        } = queryParams

        const queryCount = `
            SELECT count(*)
                FROM public."Users"
                WHERE "login" LIKE $1 AND "email" LIKE $2 ${banStatus !== 'all' ? 'AND "isBanned" = ' + banStatus === 'banned' ? true : false : ''}
        `

        const totalCountData = await this.dataSource.query(queryCount, [`%${searchLoginTerm}%`, `%${searchEmailTerm}%`])
        const totalCount = totalCountData[0].count
        const pagesCount = Math.ceil(totalCount / +pageSize)

        const skipCount = (+pageNumber - 1) * +pageSize

        const query = `
            SELECT *
                FROM public."Users"
                WHERE "login" LIKE $1 AND "email" LIKE $2 ${banStatus !== 'all' ? 'AND "isBanned" = ' + banStatus === 'banned' ? true : false : ''}
                ORDER BY $3 ${sortDirection}
                LIMIT $4 OFFSET $5;
        `

        const resultedUsers: UserSQLModel[] = await this.dataSource.query(query, [`%${searchLoginTerm}%`, `%${searchEmailTerm}%`, sortBy, pageSize, skipCount])

        const diapayedUsers = resultedUsers.map((user) => new UserViewModelType(user))

        return {
            pagesCount: pagesCount,
            page: +pageNumber,
            pageSize: +pageSize,
            totalCount: +totalCount,
            items: diapayedUsers
        }
    }

    async findUserById(userId: string): Promise<UserViewModelType> {
        const queryString = `
            SELECT *
                FROM public."Users"
                WHERE id = $1;
        `

        const findedUserData: UserSQLModel = await this.dataSource.query(queryString, [userId])

        return new UserViewModelType(findedUserData[0])
    }
}