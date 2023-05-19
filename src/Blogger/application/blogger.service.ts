import { Injectable } from '@nestjs/common'
import { UserDTO } from '../../SuperAdmin/domain/UsersTypes'
import { BannedUserViewModel } from './dto/BannedUserViewModel'

@Injectable()
export class BloggerService {
    prepareUsersForBloggerDisplay(rawUsers: Array<UserDTO | BannedUserViewModel>): Array<BannedUserViewModel> {
        return rawUsers.map(user => ({
            id: user.id,
            login: user.login,
            banInfo: {
                isBanned: user.banInfo.isBanned,
                banDate: user.banInfo.banDate,
                banReason: user.banInfo.banReason,
            }
        }))
    }
}