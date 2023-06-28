import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { UserEntity } from "../../domain/typeORM/user.entity"
import { Repository } from "typeorm"
import { UserViewModelType } from "../../application/dto/UsersViewModel"
import { UserBanInfo } from "../../domain/typeORM/user-ban-info.entity"

@Injectable()
export class UsersTypeORMQueryRepository {
    constructor(
        @InjectRepository(UserEntity)
        private usersRepository: Repository<UserEntity>,
        @InjectRepository(UserBanInfo)
        private banInfoRepository: Repository<UserBanInfo>,
    ) { }

    async findUserById(userId: string): Promise<UserViewModelType> {
        try {
            const findedUserData = await this.usersRepository.findOneBy({ id: userId })

            const findedBanInfoData = await this.banInfoRepository
                .createQueryBuilder('ubi')
                .where(`ubi.userId = :userId`, { userId })
                .getOne()

            return new UserViewModelType({
                ...findedUserData, ...findedBanInfoData
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
        const user = await this.findUserData(userId)

        return user ? true : false
    }
}