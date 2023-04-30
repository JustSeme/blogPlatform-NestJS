import { UserViewModelType } from '../../SuperAdmin/application/dto/UsersViewModel'
import { Injectable } from '@nestjs/common'
import { UserDTO } from '../../general/users/domain/UsersTypes'


//transaction script
@Injectable()
export class AuthService {
    public prepareUserForDisplay(newUser: UserDTO): UserViewModelType {
        return {
            id: newUser.id,
            login: newUser.login,
            email: newUser.email,
            createdAt: newUser.createdAt
        }
    }
}