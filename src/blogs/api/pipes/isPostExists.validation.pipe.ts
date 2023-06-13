import {
    Injectable, NotFoundException, PipeTransform
} from "@nestjs/common"
import { generateErrorsMessages } from "../../../general/helpers"
import { PostsSQLRepository } from "../../../Blogger/infrastructure/posts/posts-sql-repository"

@Injectable()
export class IsPostExistsPipe implements PipeTransform {
    constructor(private postsRepository: PostsSQLRepository) { }

    async transform(postId: string): Promise<string> {
        if (!(await this.postsRepository.isPostExists(postId))) {
            throw new NotFoundException(generateErrorsMessages('post by postId parameter is not exists', 'postId'))
        }
        return postId
    }

}