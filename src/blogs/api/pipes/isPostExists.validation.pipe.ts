import {
    Injectable, NotFoundException, PipeTransform
} from "@nestjs/common"
import { PostsRepository } from "src/blogs/infrastructure/posts/posts-db-repository"
import { generateErrorsMessages } from "src/general/helpers"

@Injectable()
export class IsPostExistsPipe implements PipeTransform {
    constructor(private postsRepository: PostsRepository) { }

    async transform(postId: string): Promise<string> {
        if (!(await this.postsRepository.isPostExists(postId))) {
            throw new NotFoundException(generateErrorsMessages('post by postId parameter is not exists', 'postId'))
        }
        return postId
    }

}