import {
    Injectable, NotFoundException, PipeTransform
} from "@nestjs/common"
import { CommentsRepository } from "src/blogs/infrastructure/comments/comments-db-repository"
import { generateErrorsMessages } from "src/helpers"

@Injectable()
export class IsCommentExistsPipe implements PipeTransform {
    constructor(private commentsRepository: CommentsRepository) { }

    async transform(commentId: string): Promise<string> {
        if (!(await this.commentsRepository.isCommentExists(commentId))) {
            throw new NotFoundException(generateErrorsMessages('Comment by commentId paramether is not found', 'commentId'))
        }
        return commentId
    }

}