import { Injectable } from '@nestjs/common'
import { UserDTO } from '../../SuperAdmin/domain/UsersTypes'
import { BannedUserViewModel } from './dto/BannedUserViewModel'

@Injectable()
export class BloggerService {
    prepareUsersForBloggerDisplay(rawUsers: Array<UserDTO>, blogId: string): Array<BannedUserViewModel> {
        return rawUsers.map(user => {
            const currentBanByBlogId = user.bansForBlog.find((ban) => ban.blogId === blogId)

            return {
                id: user.id,
                login: user.login,
                banInfo: {
                    isBanned: currentBanByBlogId.isBanned,
                    banDate: currentBanByBlogId.banDate,
                    banReason: currentBanByBlogId.banReason,
                }
            }
        })
    }
}