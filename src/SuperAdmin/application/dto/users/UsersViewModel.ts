import { OutputData } from "../../../../general/types/OutputData"
import { UserBanInfo } from "../../../domain/typeORM/user-ban-info.entity"
import { UserEntity } from "../../../domain/typeORM/user.entity"

export class UserViewModelType {
    public banInfo: BanInfoViewType
    public id: string
    public login: string
    public email: string
    public createdAt: Date

    constructor(
        user: UserEntity & UserBanInfo,
    ) {
        this.id = user.id
        this.login = user.login
        this.email = user.email
        this.createdAt = user.createdAt

        this.banInfo = {
            isBanned: user.isBanned,
            banDate: user.banDate,
            banReason: user.banReason
        }
    }
}

type BanInfoViewType = {
    isBanned: boolean,
    banDate: Date,
    banReason: string
}

export type BanInfoDBType = {
    isBanned: boolean,
    banDate: Date,
    banReason: string
}

export type UsersWithQueryOutputModel = OutputData<UserViewModelType>