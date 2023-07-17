import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs/dist"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"
import { QuestionInputModel } from "../../../api/models/QuestionInputModel"
import { QuizRepository } from "../../../infrastructure/typeORM/quiz-typeORM-repository"
import { Question } from "../../../domain/typeORM/question.entity"
import { Answer } from "../../../domain/typeORM/answer.entity"

export class CreateQuestionCommand {
    constructor(
        public questionInputModel: QuestionInputModel
    ) { }
}

@CommandHandler(CreateQuestionCommand)
export class CreatQuestionUseCase implements ICommandHandler<CreateQuestionCommand> {
    constructor(
        @InjectDataSource() private dataSource: DataSource,
        private quizRepository: QuizRepository,
    ) { }

    async execute(command: CreateQuestionCommand): Promise<string | null> {
        const questionInputModel = command.questionInputModel

        const queryRunner = this.dataSource.createQueryRunner()

        await queryRunner.connect()

        await queryRunner.startTransaction()

        try {
            const queryRunnerManager = queryRunner.manager

            const creatingQuestion = new Question()
            creatingQuestion.body = questionInputModel.body

            const creatingAnswer = new Answer(0)

            await queryRunner.commitTransaction()
        } catch (err) {
            console.error(err)

            await queryRunner.rollbackTransaction()

            return null
        } finally {
            await queryRunner.release()
        }
    }
}