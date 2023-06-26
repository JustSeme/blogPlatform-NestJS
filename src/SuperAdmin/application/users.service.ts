import { Injectable } from "@nestjs/common"
import { UserViewModelType } from "./dto/UsersViewModel"
import { UserDTO } from "../domain/UsersTypes"

@Injectable()
export class UsersService {
    /* prepareUsersForDisplay(rawUsers: Array<UserViewModelType | UserDTO>): Array<UserViewModelType> {
        return rawUsers.map((user) => this.prepareUserForDisplay(user))
    }
 */
    /* prepareUserForDisplay(rawUser: UserViewModelType | UserDTO): UserViewModelType {
        return {
            id: rawUser.id,
            login: rawUser.login,
            email: rawUser.email,
            createdAt: rawUser.createdAt,
            banInfo: {
                isBanned: rawUser.banInfo.isBanned,
                banDate: rawUser.banInfo.banDate,
                banReason: rawUser.banInfo.banReason
            }
        }
    } */
}