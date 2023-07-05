import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { UserEntity } from "../../domain/typeORM/user.entity"
import { Repository } from "typeorm"
import {
    UserViewModelType, UsersWithQueryOutputModel
} from "../../application/dto/UsersViewModel"
import { UserBanInfo } from "../../domain/typeORM/user-ban-info.entity"
import { ReadUsersQuery } from "../../api/models/ReadUsersQuery"

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

        const resultedUsers = await builder.getMany()

        const displayedUsers = resultedUsers.map((user) => new UserViewModelType({
            ...user,
            ...user.banInfo
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
            return this.usersRepository.findOneBy({ id: userId })
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