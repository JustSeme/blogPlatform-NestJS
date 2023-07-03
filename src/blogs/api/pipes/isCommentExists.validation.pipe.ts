import {
    Injectable, NotFoundException, PipeTransform
} from "@nestjs/common"
import { generateErrorsMessages } from "../../../general/helpers"
import { CommentsSQLRepository } from "../../infrastructure/comments/rawSQL/comments-sql-repository"

@Injectable()
export class IsCommentExistsPipe implements PipeTransform {
    constructor(private commentsRepository: CommentsSQLRepository) { }

    async transform(commentId: string): Promise<string> {
        if (!(await this.commentsRepository.isCommentExists(commentId))) {
            throw new NotFoundException(generateErrorsMessages('Comment by commentId paramether is not found', 'commentId'))
        }
        return commentId
    }

}