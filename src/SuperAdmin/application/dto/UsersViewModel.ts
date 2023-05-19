import { OutputData } from "../../../general/types/OutputData"

export type UserViewModelType = {
    id: string
    login: string
    email: string
    createdAt: string
    banInfo: BanInfoViewType
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