import { Injectable } from "@nestjs/common"
import { UserViewModelType } from "../../SuperAdmin/application/dto/UsersViewModel"
import { UserDTO } from "./domain/UsersTypes"

@Injectable()
export class UsersService {

    prepareUsersForDisplay(rawUsers: Array<UserViewModelType | UserDTO>): Array<UserViewModelType> {
        return rawUsers.map((user) => ({
            id: user.id,
            login: user.login,
            email: user.email,
            createdAt: user.createdAt,
            banInfo: { ...user.banInfo }
        }))
    }
}