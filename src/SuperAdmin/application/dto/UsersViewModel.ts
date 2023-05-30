import { OutputData } from "../../../general/types/OutputData"

export class UserViewModelType {
    banInfo: BanInfoViewType

    constructor(
        public id: string,
        public login: string,
        public email: string,
        public createdAt: string,
        isBanned: boolean,
        banDate: Date,
        banReason: string
    ) {
        this.banInfo.isBanned = isBanned
        this.banInfo.banDate = banDate
        this.banInfo.banReason = banReason
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