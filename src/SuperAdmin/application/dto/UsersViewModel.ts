import { OutputData } from "../../../general/types/OutputData"
import { UserSQLModel } from "../../infrastructure/UsersTypes"

export class UserViewModelType {
    public banInfo: BanInfoViewType
    public id: string
    public login: string
    public email: string
    public createdAt: string

    constructor(
        user: UserSQLModel,
    ) {
        this.id = user.id
        this.login = user.email
        this.createdAt = user.createdAt

        this.banInfo = {
            isBanned: user.isBanned,
            banDate: user.banDate,
            banReason: user.banReason
        }
    }

    isBanned() {
        return this.banInfo.isBanned
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