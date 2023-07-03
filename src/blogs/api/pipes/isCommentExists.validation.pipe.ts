import {
    Injectable, NotFoundException, PipeTransform
} from "@nestjs/common"
import { generateErrorsMessages } from "../../../general/helpers"
import { CommentsTypeORMRepository } from "../../infrastructure/comments/typeORM/comments-typeORM-repository"

@Injectable()
export class IsCommentExistsPipe implements PipeTransform {
    constructor(private commentsRepository: CommentsTypeORMRepository) { }

    async transform(commentId: string): Promise<string> {
        if (!(await this.commentsRepository.isCommentExists(commentId))) {
            throw new NotFoundException(generateErrorsMessages('Comment by commentId paramether is not found', 'commentId'))
        }
        return commentId
    }

}