import {
    Body,
    Controller, Get, HttpCode, HttpStatus, NotImplementedException, Param, Post, Put, Query, UseGuards
} from "@nestjs/common"
import { QuestionInputModel } from "./models/quiz/QuestionInputModel"
import {
    QuestionViewModel, QuestionsWithQueryOutputModel
} from "../application/dto/quiz/QuestionViewModel"
import { CommandBus } from "@nestjs/cqrs"
import { CreateQuestionCommand } from "../application/use-cases/quiz/create-question.use-case"
import { QuizQueryRepository } from "../infrastructure/typeORM/quiz-typeORM-query-repository"
import { BasicAuthGuard } from "../../general/guards/basic-auth.guard"
import { ReadQuestionsQuery } from "./models/quiz/ReadQuestionsQuery"

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

    @Get('questions')
    async getQuestions(
        @Query() questionsQueryOptions: ReadQuestionsQuery
    ): Promise<QuestionsWithQueryOutputModel> {
        const questions = await this.quizQueryRepository.findQuestions(questionsQueryOptions)
        return questions
    }

    @Put('questions/:questionId')
    async updateQuestion(
        @Param('questionId') questionId,
    ) {
        await this.commandBus
    }
}