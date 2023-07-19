import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs/dist"
import { QuizRepository } from "../../infrastructure/quiz-typeORM-repository"
import { QuizQueryRepository } from "../../infrastructure/quiz-typeORM-query-repository"

export class UpdatePublishQuestionCommand {
    constructor(
        public isPublished: boolean,
        public questionId: string
    ) { }
}

@CommandHandler(UpdatePublishQuestionCommand)
export class UpdatePublishQuestionUseCase implements ICommandHandler<UpdatePublishQuestionCommand> {
    constructor(
        private quizRepository: QuizRepository,
        private quizQueryRepository: QuizQueryRepository,
    ) { }

    async execute(command: UpdatePublishQuestionCommand): Promise<boolean> {
        const {
            isPublished, questionId
        } = command

        const questionById = await this.quizQueryRepository.getQuestionById(questionId)

        // check if question correctAnswers array is empty - we can't publish this question
        if (isPublished && !questionById.answers.length) {
            return false
        }

        questionById.isPublished = isPublished

        const savedQuestion = await this.quizRepository.dataSourceSave(questionById)

        return savedQuestion ? true : false
    }
}