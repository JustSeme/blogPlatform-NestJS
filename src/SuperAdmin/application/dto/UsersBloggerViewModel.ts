import { BansUsersForBlogs } from "../../../Blogger/domain/blogs/bans-users-for-blogs.entity"
import { UserEntity } from "../../domain/typeORM/user.entity"
import { BanInfoDBType } from "./UsersViewModel"

export class UsersBloggerViewModel {
    public id: string
    public login: string
    public banInfo: BanInfoDBType

    constructor(rawUser: UserEntity & BansUsersForBlogs) {
        this.id = rawUser.id
        this.login = rawUser.login
        this.banInfo = {
            isBanned: rawUser.isBanned,
            banDate: rawUser.banDate,
            banReason: rawUser.banReason
        }
    }

}