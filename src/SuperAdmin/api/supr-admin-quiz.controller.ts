import {
    BadRequestException,
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
import { generateErrorsMessages } from "../../general/helpers/helpers"
import { IsQuestionExists } from "./pipes/isQuestionExists.validation.pipe"
import { UpdateQuestionCommand } from "../application/use-cases/quiz/update-question.use-case"

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

        const questionById = await this.quizQueryRepository.findQuestionById(createdQuestionId)
        return questionById
    }

    @Get('questions')
    async getQuestions(
        @Query() questionsQueryOptions: ReadQuestionsQuery
    ): Promise<QuestionsWithQueryOutputModel> {
        const questions = await this.quizQueryRepository.findQuestions(questionsQueryOptions)
        return questions
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Put('questions/:questionId')
    async updateQuestion(
        @Body() questionUpdateModel: QuestionInputModel,
        @Param('questionId', IsQuestionExists) questionId,
    ) {
        const isUpdated = await this.commandBus.execute(
            new UpdateQuestionCommand(questionUpdateModel, questionId)
        )

        if (!isUpdated) {
            throw new BadRequestException(generateErrorsMessages(`You can't set empty correctAnswers array - this question is published`, 'correctAnswers'))
        }
    }
}