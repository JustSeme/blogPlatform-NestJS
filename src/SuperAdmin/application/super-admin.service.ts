import { Injectable } from "@nestjs/common"
import { UserViewModelType } from "./dto/UsersViewModel"
import { UserDTO } from "../domain/UsersTypes"

@Injectable()
export class UsersService {
    prepareUsersForDisplay(rawUsers: Array<UserViewModelType | UserDTO>): Array<UserViewModelType> {
        return rawUsers.map((user) => {
            return new UserViewModelType(
                user.id,
                user.login,
                user.email,
                user.createdAt,
                user.banInfo.isBanned,
                user.banInfo.banDate,
                user.banInfo.banReason
            )
        })
    }
}