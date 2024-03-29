import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { UserEntity } from "../../domain/typeORM/user.entity"
import { Repository } from "typeorm"
import {
    UserViewModelType, UsersWithQueryOutputModel
} from "../../application/dto/users/UsersViewModel"
import { UserBanInfo } from "../../domain/typeORM/users/user-ban-info.entity"
import { ReadUsersQuery } from "../../api/models/users/ReadUsersQuery"
import { ReadBannedUsersQueryParams } from "../../../Blogger/api/models/ReadBannedUsersQueryParams"
import { BannedUsersOutputModel } from "../../../Blogger/application/dto/BannedUserViewModel"

@Injectable()
export class UsersTypeORMQueryRepository {
    constructor(
        @InjectRepository(UserEntity)
        private usersRepository: Repository<UserEntity>,
        @InjectRepository(UserBanInfo)
        private banInfoRepository: Repository<UserBanInfo>,
    ) { }

    async findUsers(queryParams: ReadUsersQuery): Promise<UsersWithQueryOutputModel> {
        const {
            sortDirection = 'DESC', sortBy = 'createdAt', pageNumber = 1, pageSize = 10, searchLoginTerm = '', searchEmailTerm = '', banStatus = 'all'
        } = queryParams

        const {
            emailTerm,
            loginTerm
        } = this.prepareTermsForUser(searchEmailTerm, searchLoginTerm)

        const totalCountBuilder = this.usersRepository
            .createQueryBuilder('ue')
            .where('(lower(ue.login) LIKE :loginTerm OR lower(ue.email) LIKE :emailTerm)', {
                loginTerm,
                emailTerm
            })

        if (banStatus !== 'all') {
            const isBanned = banStatus === 'banned' ? true : false
            totalCountBuilder.andWhere('ue.isBanned = :isBanned', { isBanned })
        }

        const totalCount = await totalCountBuilder
            .getCount()

        const pagesCount = Math.ceil(totalCount / +pageSize)
        const skipCount = (+pageNumber - 1) * +pageSize

        let resultedUsers

        try {
            const builder = await this.usersRepository
                .createQueryBuilder('ue')
                .leftJoinAndSelect('ue.banInfo', 'ubi')
                .where('(lower(ue.login) LIKE :loginTerm OR lower(ue.email) LIKE :emailTerm)', {
                    loginTerm,
                    emailTerm
                })
                .orderBy(`ue.${sortBy}`, sortDirection)
                .limit(pageSize)
                .offset(skipCount)

            if (banStatus !== 'all') {
                const isBanned = banStatus === 'banned' ? true : false
                builder.andWhere('ue.isBanned = :isBanned', { isBanned })
            }

            resultedUsers = await builder.getMany()
        } catch (err) {
            console.error(err)
            throw new Error('Something wrong with database...')
        }


        const displayedUsers = resultedUsers.map((user) => new UserViewModelType({
            ...user,
            ...user.banInfo,
            id: user.id
        }))

        return {
            pagesCount: pagesCount,
            page: +pageNumber,
            pageSize: +pageSize,
            totalCount: +totalCount,
            items: displayedUsers
        }
    }

    async findBannedUsersByBlogId(queryParams: ReadBannedUsersQueryParams, blogId: string): Promise<BannedUsersOutputModel> {
        const {
            sortDirection = 'DESC', sortBy = 'createdAt', pageNumber = 1, pageSize = 10, searchLoginTerm = ''
        } = queryParams

        const { loginTerm } = this.prepareTermsForUser('', searchLoginTerm)

        const totalCountBuilder = this.usersRepository
            .createQueryBuilder('ue')
            .leftJoinAndSelect('ue.bansForUser', 'bufb')
            .where('lower(ue.login) LIKE :loginTerm', { loginTerm })
            .andWhere('"bufb"."blogId" = :blogId', { blogId })
            .andWhere('"bufb"."isBanned" = true')

        //TODO тут добавить andWhere чтобы проверять что в bufb.isBanned
        const totalCount = await totalCountBuilder
            .getCount()

        const pagesCount = Math.ceil(totalCount / +pageSize)
        const skipCount = (+pageNumber - 1) * +pageSize

        let resultedUsers

        try {
            const builder = await this.usersRepository
                .createQueryBuilder('ue')
                .leftJoinAndSelect('ue.bansForUser', 'bufb')
                .where('lower(ue.login) LIKE :loginTerm', { loginTerm })
                .andWhere('"bufb"."blogId" = :blogId', { blogId })
                .andWhere('"bufb"."isBanned" = true')
                .orderBy(`ue.${sortBy}`, sortDirection)
                .limit(pageSize)
                .offset(skipCount)

            resultedUsers = await builder.getMany()
        } catch (err) {
            console.error(err)
            throw new Error(err)
        }

        const displayedUsers = resultedUsers.map((user) => ({
            id: user.id,
            login: user.login,
            banInfo: {
                isBanned: user.bansForUser[0].isBanned,
                banDate: user.bansForUser[0].banDate,
                banReason: user.bansForUser[0].banReason,
            }
        }))

        return {
            pagesCount: pagesCount,
            page: +pageNumber,
            pageSize: +pageSize,
            totalCount: +totalCount,
            items: displayedUsers
        }
    }

    private prepareTermsForUser(searchEmailTerm: string, searchLoginTerm: string): { emailTerm: string, loginTerm: string } {
        if (searchEmailTerm) {
            const emailTerm = `%${searchEmailTerm.toLocaleLowerCase()}%`
            if (searchLoginTerm) {
                const loginTerm = `%${searchLoginTerm.toLocaleLowerCase()}%`
                return {
                    emailTerm,
                    loginTerm,
                }
            }
            return {
                emailTerm,
                loginTerm: ''
            }
        }

        if (searchLoginTerm) {
            const loginTerm = `%${searchLoginTerm.toLocaleLowerCase()}%`
            if (searchEmailTerm) {
                const emailTerm = `%${searchEmailTerm.toLocaleLowerCase()}%`
                return {
                    emailTerm,
                    loginTerm,
                }
            }
            return {
                emailTerm: '',
                loginTerm,
            }
        }

        return {
            emailTerm: '%%',
            loginTerm: '%%',
        }
    }

    async findUserById(userId: string): Promise<UserViewModelType> {
        try {
            const findedUserData = await this.usersRepository.findOneBy({ id: userId })

            const findedBanInfoData = await this.banInfoRepository
                .createQueryBuilder('ubi')
                .where(`ubi.userId = :userId`, { userId })
                .getOne()

            return new UserViewModelType({
                ...findedUserData,
                ...findedBanInfoData,
                id: findedUserData.id,
                createdAt: findedUserData.createdAt,
            })
        } catch (err) {
            console.error(err)
            return null
        }
    }

    async findUserData(userId: string): Promise<UserEntity> {
        try {
            const userData = await this.usersRepository.findOneBy({ id: userId })

            return userData
        } catch (err) {
            console.error(err)
            return null
        }
    }

    async isUserExists(userId: string): Promise<boolean> {
        try {
            const user = await this.findUserData(userId)
            return user ? true : false
        } catch (err) {
            console.error(err)
            return false
        }
    }
}