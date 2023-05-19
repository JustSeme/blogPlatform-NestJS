import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose/dist"
import { User } from "../domain/UsersSchema"
import { UserModelType } from "../domain/UsersTypes"
import { ReadUsersQuery } from "../api/models/ReadUsersQuery"
import { UsersWithQueryOutputModel } from "../application/dto/UsersViewModel"
import { ReadBannedUsersQueryParams } from "../../Blogger/api/models/ReadBannedUsersQueryParams"

@Injectable()
export class UsersQueryRepository {
    constructor(@InjectModel(User.name) private UserModel: UserModelType) { }

    async findUsers(queryParams: ReadUsersQuery): Promise<UsersWithQueryOutputModel> {
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
    }

    async findBannedUsersByBlogId(queryParams: ReadBannedUsersQueryParams, blogId: string) {
        const {
            sortDirection = 'desc', sortBy = 'createdAt', pageNumber = 1, pageSize = 10, searchLoginTerm = null
        } = queryParams

        const filterArray: any = [
            { 'bansForBlog.blogId': blogId }
        ]
        if (searchLoginTerm) {
            filterArray.push({
                login: {
                    $regex: searchLoginTerm, $options: 'i'
                }
            })
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
    }

    async findUserById(userId: string) {
        return this.UserModel.findOne({ id: userId }, {
            _id: 0, __v: 0
        }).lean()
    }

    async findUserByLogin(login: string) {
        return this.UserModel.findOne({ login: login }).lean()
    }

    async findUserByRecoveryPasswordCode(code: string) {
        return this.UserModel.findOne({ 'passwordRecovery.confirmationCode': code }).lean()
    }

    async findUserByEmail(email: string) {
        return this.UserModel.findOne({ email: email }).lean()
    }
}