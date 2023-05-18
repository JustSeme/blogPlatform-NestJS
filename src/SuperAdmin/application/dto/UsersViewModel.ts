
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

export type BanForBlogDBType = {
    isBanned: boolean
    banReason: string
    blogId: string
}

export type UsersWithQueryOutputModel = {
    pagesCount: number
    page: number
    pageSize: number
    totalCount: number
    items: UserViewModelType[]
}