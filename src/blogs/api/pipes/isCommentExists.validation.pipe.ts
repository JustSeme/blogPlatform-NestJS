import {
    Injectable, NotFoundException, PipeTransform
} from "@nestjs/common"
import { CommentsRepository } from "src/blogs/infrastructure/comments/comments-db-repository"

@Injectable()
export class IsCommentExistsPipe implements PipeTransform {
    constructor(private commentsRepository: CommentsRepository) { }

    async transform(commentId: string): Promise<string> {
        if (!(await this.commentsRepository.isCommentExists(commentId))) {
            throw new NotFoundException([{
                message: 'comment by commentId parameter is not exists',
                field: 'commentId'
            }])
        }
        return commentId
    }

}