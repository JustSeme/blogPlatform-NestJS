import {
    NotFoundException,
    Injectable, PipeTransform
} from "@nestjs/common"
import { generateErrorsMessages } from "../../../general/helpers/helpers"
import { QuizQueryRepository } from "../../infrastructure/typeORM/quiz-typeORM-query-repository"

@Injectable()
export class IsQuestionExists implements PipeTransform {
    constructor(private quizQueryRepository: QuizQueryRepository) { }

    async transform(questionId: string): Promise<string> {
        if (!(await this.quizQueryRepository.isQuestionExists(questionId))) {
            throw new NotFoundException(generateErrorsMessages('Question by questionId parameter is not exists', 'questionId'))
        }
        return questionId
    }

}