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

    /* async findUsers(queryParams: ReadUsersQuery): Promise<UsersWithQueryOutputModel> {
        const {
            sortDirection = 'desc', sortBy = 'createdAt', pageNumber = 1, pageSize = 10, searchLoginTerm = null, searchEmailTerm = null, banStatus = 'all'
        } = queryParams

        const filterArray: any = []
        if (searchEmailTerm) {
            filterArray.push({
                email: {
                    $regex: searchEmailTerm, $options: 'i'
                }
            })
        }
        if (searchLoginTerm) {
            filterArray.push({
                login: {
                    $regex: searchLoginTerm, $options: 'i'
                }
            })
        }
        if (banStatus === 'banned') {
            filterArray.push({ 'banInfo.isBanned': true })
        } else if (banStatus === 'notBanned') {
            filterArray.push({ 'banInfo.isBanned': false })
        }

        const filterObject = filterArray.length ? { $or: filterArray } : {}

        const totalCount = await this.UserModel.countDocuments(filterObject)
        const pagesCount = Math.ceil(totalCount / +pageSize)

        const skipCount = (+pageNumber - 1) * +pageSize
        const sortDirectionNumber = sortDirection === 'asc' ? 1 : -1

        const resultedUsers = await this.UserModel.find(filterObject, { 'banInfo._id': 0 }).skip(skipCount).limit(+pageSize).sort({ [sortBy]: sortDirectionNumber }).lean()

        return {
            pagesCount: pagesCount,
            page: +pageNumber,
            pageSize: +pageSize,
            totalCount: totalCount,
            items: resultedUsers
        }
    } */

    async findUserById(userId: string): Promise<UserViewModelType> {
        const queryString = `
            SELECT *
                FROM public."Users"
                WHERE id = $1;
        `

        const findedUserData: UserSQLModel = await this.dataSource.query(queryString, [userId])[0]

        return new UserViewModelType(findedUserData)
    }
}