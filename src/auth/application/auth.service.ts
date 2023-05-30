import { UserViewModelType } from '../../SuperAdmin/application/dto/UsersViewModel'
import { Injectable } from '@nestjs/common'
import { UserDTO } from '../../SuperAdmin/domain/UsersTypes'


//transaction script
@Injectable()
export class AuthService {
    public prepareUserForDisplay(newUser: UserDTO): UserViewModelType {
        return new UserViewModelType(
            newUser.id,
            newUser.login,
            newUser.email,
            newUser.createdAt,
            newUser.banInfo.isBanned,
            newUser.banInfo.banDate,
            newUser.banInfo.banReason
        )
    }
}