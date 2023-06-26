import { Injectable } from "@nestjs/common/decorators"
import { DataSource } from "typeorm"
import {
    UserViewModelType, UsersWithQueryOutputModel
} from "../../application/dto/UsersViewModel"
import { ReadUsersQuery } from "../../api/models/ReadUsersQuery"
import { UserEntity } from "../../domain/typeORM/user.entity"
import { UserBanInfo } from "../../domain/typeORM/user-ban-info.entity"
import { ReadBannedUsersQueryParams } from "../../../Blogger/api/models/ReadBannedUsersQueryParams"
import { UsersBloggerViewModel } from "../../application/dto/UsersBloggerViewModel"
import { BansUsersForBlogs } from "../../../Blogger/domain/blogs/bans-users-for-blogs.entity"

@Injectable()
export class UsersQuerySQLRepository {
    constructor(
        private dataSource: DataSource
    ) { }

    async findUsers(queryParams: ReadUsersQuery): Promise<UsersWithQueryOutputModel> {
        const {
            sortDirection = 'desc', sortBy = 'createdAt', pageNumber = 1, pageSize = 10, searchLoginTerm = '', searchEmailTerm = '', banStatus = 'all'
        } = queryParams

        const isBanned = banStatus === 'banned' ? true : false

        const queryCount = `
            SELECT count(*)
                FROM public."user_entity"
                WHERE (lower("login") LIKE lower($1) OR lower("email") LIKE lower($2)) ${banStatus !== 'all' ? `AND "isBanned" = ${isBanned}` : ''}
        `

        const totalCountData = await this.dataSource.query(queryCount, [`%${searchLoginTerm}%`, `%${searchEmailTerm}%`])
        const totalCount = totalCountData[0].count
        const pagesCount = Math.ceil(totalCount / +pageSize)

        const skipCount = (+pageNumber - 1) * +pageSize

        const query = `
            SELECT *, ue."id"
                FROM public."user_entity" ue
                LEFT JOIN user_ban_info ubi ON ubi."userId" = ue.id 
                WHERE (lower("login") LIKE lower($1) OR lower("email") LIKE lower($2)) ${banStatus !== 'all' ? `AND ue."isBanned" = ${isBanned}` : ''}
                ORDER BY "${sortBy}" ${sortDirection}
                LIMIT $3 OFFSET $4;
        `

        const resultedUsers: Array<UserEntity & UserBanInfo> = await this.dataSource.query(query, [`%${searchLoginTerm}%`, `%${searchEmailTerm}%`, pageSize, skipCount])

        const diapayedUsers = resultedUsers.map((user) => new UserViewModelType(user))

        return {
            pagesCount: pagesCount,
            page: +pageNumber,
            pageSize: +pageSize,
            totalCount: +totalCount,
            items: diapayedUsers
        }
    }

    async findBannedUsersByBlogId(queryParams: ReadBannedUsersQueryParams, blogId: string) {
        const {
            sortDirection = 'desc', sortBy = 'createdAt', pageNumber = 1, pageSize = 10, searchLoginTerm = ''
        } = queryParams

        const queryCount = `
            SELECT count(*)
                FROM public."bans_users_for_blogs" bufb
                LEFT JOIN public."user_entity" ue ON bufb."userId" = ue."id"
                WHERE lower(ue."login") LIKE lower($1) AND bufb."blogId" = $2
        `

        const totalCountData = await this.dataSource.query(queryCount, [`%${searchLoginTerm}%`, blogId])
        const totalCount = totalCountData[0].count
        const pagesCount = Math.ceil(totalCount / +pageSize)

        const skipCount = (+pageNumber - 1) * +pageSize

        const query = `
            SELECT *, ue."id", bufb."isBanned"
                FROM public."bans_users_for_blogs" bufb
                LEFT JOIN user_entity ue ON bufb."userId" = ue."id"
                WHERE lower(ue."login") LIKE lower($1) AND bufb."blogId" = $2
                ORDER BY "${sortBy}" ${sortDirection}
                LIMIT $3 OFFSET $4;
        `

        const resultedUsers: Array<UserEntity & BansUsersForBlogs> = await this.dataSource.query(query, [`%${searchLoginTerm}%`, blogId, pageSize, skipCount])

        const diapayedUsers = resultedUsers.map((user) => new UsersBloggerViewModel(user))

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
            SELECT *, ue."id"
                FROM public."user_entity" ue
                LEFT JOIN user_ban_info ubi on ubi."userId" = ue.id 
                WHERE ue."id" = $1;
        `

        const findedUserData: UserEntity & UserBanInfo = await this.dataSource.query(queryString, [userId])

        return new UserViewModelType(findedUserData[0])
    }
}