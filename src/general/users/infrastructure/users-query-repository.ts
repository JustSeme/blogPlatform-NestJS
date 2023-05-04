import { Injectable } from "@nestjs/common"
import { ReadUsersQuery } from "../../../SuperAdmin/api/models/ReadUsersQuery"
import {
    UserViewModelType, UsersWithQueryOutputModel
} from "../../../SuperAdmin/application/dto/UsersViewModel"
import { InjectModel } from "@nestjs/mongoose/dist"
import { User } from "../domain/UsersSchema"
import {
    UserDTO, UserModelType
} from "../domain/UsersTypes"

@Injectable()
export class UsersQueryRepository {
    constructor(@InjectModel(User.name) private UserModel: UserModelType) { }

    async findUsers(queryParams: ReadUsersQuery): Promise<UsersWithQueryOutputModel> {
        const {
            sortDirection = 'desc', sortBy = 'createdAt', pageNumber = 1, pageSize = 10, searchLoginTerm = null, searchEmailTerm = null
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

        const filterObject = filterArray.length ? { $or: filterArray } : {}

        const totalCount = await this.UserModel.countDocuments(filterObject)
        const pagesCount = Math.ceil(totalCount / +pageSize)

        const skipCount = (+pageNumber - 1) * +pageSize
        const sortDirectionNumber = sortDirection === 'asc' ? 1 : -1

        const resultedUsers = await this.UserModel.find(filterObject).skip(skipCount).limit(+pageSize).sort({ [sortBy]: sortDirectionNumber }).lean()

        const displayedUsers = this.prepareUsersForDisplay(resultedUsers)

        return {
            pagesCount: pagesCount,
            page: +pageNumber,
            pageSize: +pageSize,
            totalCount: totalCount,
            items: displayedUsers
        }
    }

    private prepareUsersForDisplay(resultedUsers: UserDTO[]): UserViewModelType[] {
        return resultedUsers.map(el => ({
            id: el.id,
            login: el.login,
            email: el.email,
            createdAt: el.createdAt,
            banInfo: {
                isBanned: el.banInfo.isBanned,
                banDate: el.banInfo.banDate,
                banReason: el.banInfo.banReason,
            }
        }))
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