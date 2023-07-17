import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs/dist"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"
import { QuestionInputModel } from "../../../api/models/quiz/QuestionInputModel"
import { QuizRepository } from "../../../infrastructure/typeORM/quiz-typeORM-repository"
import { Question } from "../../../domain/typeORM/question.entity"

export class CreateQuestionCommand {
    constructor(
        public questionInputModel: QuestionInputModel
    ) { }
}

@CommandHandler(CreateQuestionCommand)
export class CreateQuestionUseCase implements ICommandHandler<CreateQuestionCommand> {
    constructor(
        @InjectDataSource() private dataSource: DataSource,
        private quizRepository: QuizRepository,
    ) { }

    async execute(command: CreateQuestionCommand): Promise<string | null> {
        const questionInputModel = command.questionInputModel

        const creatingQuestion = new Question()
        creatingQuestion.body = questionInputModel.body
        creatingQuestion.answers = questionInputModel.correctAnswers
        creatingQuestion.updatedAt = new Date()

        const savedQuestion = await this.quizRepository.dataSourceSave(creatingQuestion)

        return savedQuestion ? savedQuestion.id : null
    }
}