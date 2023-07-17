import {
    Body,
    Controller, HttpCode, HttpStatus, NotImplementedException, Post, UseGuards
} from "@nestjs/common"
import { QuestionInputModel } from "./models/QuestionInputModel"
import { QuestionViewModel } from "../application/dto/QuestionViewModel"
import { CommandBus } from "@nestjs/cqrs"
import { CreateQuestionCommand } from "../application/use-cases/quiz/create-question.use-case"
import { QuizQueryRepository } from "../infrastructure/typeORM/quiz-typeORM-query-repository"
import { BasicAuthGuard } from "../../general/guards/basic-auth.guard"

@UseGuards(BasicAuthGuard)
@Controller('sa/quiz')
export class SuperAdminQuizController {
    constructor(
        private commandBus: CommandBus,
        private quizQueryRepository: QuizQueryRepository
    ) { }


    @HttpCode(HttpStatus.CREATED)
    @Post('questions')
    async createQuestion(
        @Body() questionInputModel: QuestionInputModel
    ): Promise<QuestionViewModel> {
        const createdQuestionId = await this.commandBus.execute(
            new CreateQuestionCommand(questionInputModel)
        )

        if (!createdQuestionId) {
            throw new NotImplementedException('Question is not saved')
        }

        const questionById = await this.quizQueryRepository.getQuestionById(createdQuestionId)
        return questionById
    }
}