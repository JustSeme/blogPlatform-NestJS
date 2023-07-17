import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs/dist"
import { QuestionInputModel } from "../../../api/models/quiz/QuestionInputModel"
import { QuizRepository } from "../../../infrastructure/typeORM/quiz-typeORM-repository"
import { QuizQueryRepository } from "../../../infrastructure/typeORM/quiz-typeORM-query-repository"

export class UpdateQuestionCommand {
    constructor(
        public questionUpdateModel: QuestionInputModel,
        public questionId: string
    ) { }
}

@CommandHandler(UpdateQuestionCommand)
export class UpdateQuestionUseCase implements ICommandHandler<UpdateQuestionCommand> {
    constructor(
        private quizRepository: QuizRepository,
        private quizQueryRepository: QuizQueryRepository,
    ) { }

    async execute(command: UpdateQuestionCommand): Promise<boolean> {
        const {
            questionUpdateModel, questionId
        } = command

        const questionById = await this.quizQueryRepository.getQuestionById(questionId)

        // check if question isPublished - we can't set emty correctAnswers array
        if (questionById.isPublished && !questionUpdateModel.correctAnswers.length) {
            return false
        }

        questionById.body = questionUpdateModel.body
        questionById.answers = questionUpdateModel.correctAnswers

        const savedQuestion = await this.quizRepository.dataSourceSave(questionById)

        return savedQuestion ? true : false
    }
}