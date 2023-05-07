import { UserViewModelType } from '../../SuperAdmin/application/dto/UsersViewModel'
import { Injectable } from '@nestjs/common'
import { UserDTO } from '../../SuperAdmin/domain/UsersTypes'


//transaction script
@Injectable()
export class AuthService {
    public prepareUserForDisplay(newUser: UserDTO): UserViewModelType {
        return {
            id: newUser.id,
            login: newUser.login,
            email: newUser.email,
            createdAt: newUser.createdAt,
            banInfo: {
                isBanned: newUser.banInfo.isBanned,
                banDate: newUser.banInfo.banDate,
                banReason: newUser.banInfo.banReason,
            }
        }
    }
}