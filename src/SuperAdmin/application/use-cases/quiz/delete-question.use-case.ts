import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs/dist"
import { QuizRepository } from "../../../infrastructure/typeORM/quiz-typeORM-repository"
import { QuizQueryRepository } from "../../../infrastructure/typeORM/quiz-typeORM-query-repository"

export class DeleteQuestionCommand {
    constructor(
        public questionId: string
    ) { }
}

@CommandHandler(DeleteQuestionCommand)
export class DeleteQuestionUseCase implements ICommandHandler<DeleteQuestionCommand> {
    constructor(
        private quizRepository: QuizRepository,
        private quizQueryRepository: QuizQueryRepository,
    ) { }

    async execute(command: DeleteQuestionCommand): Promise<boolean> {
        const { questionId } = command

        const questionById = await this.quizQueryRepository.getQuestionById(questionId)

        if (!questionById) {
            return false
        }

        const isDeleted = await this.quizRepository.removeEntity(questionById)

        return isDeleted ? true : false
    }
}