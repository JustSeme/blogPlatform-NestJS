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
        @InjectRepository(UserEntity)
        private banInfoRepository: Repository<UserBanInfo>,
    ) { }

    async findUserById(userId: string): Promise<UserViewModelType> {
        try {
            const findedUserData = await this.usersRepository
                .createQueryBuilder('u')
                .where('u.id = :userId', { userId })
                .getOne()

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
}