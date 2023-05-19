export type BannedUserViewModel = {
    id: string,
    login: string,
    banInfo: BanUserForBlogViewInfoType
}

export type BanUserForBlogViewInfoType = {
    isBanned: boolean
    banDate: Date
    banReason: string
}    