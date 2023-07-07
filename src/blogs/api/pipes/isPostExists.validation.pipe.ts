import {
    Injectable, NotFoundException, PipeTransform
} from "@nestjs/common"
import { generateErrorsMessages } from "../../../general/helpers"
import { PostsQueryTypeORMRepository } from "../../../Blogger/infrastructure/posts/typeORM/posts-query-typeORM-repository"

@Injectable()
export class IsPostExistsPipe implements PipeTransform {
    constructor(private postsQueryRepository: PostsQueryTypeORMRepository) { }

    async transform(postId: string): Promise<string> {
        if (!(await this.postsQueryRepository.isPostExists(postId))) {
            throw new NotFoundException(generateErrorsMessages('post by postId parameter is not exists', 'postId'))
        }
        return postId
    }

}