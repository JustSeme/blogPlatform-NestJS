import {
    BadRequestException,
    Body,
    Controller, Get, HttpCode, HttpStatus, NotImplementedException, Param, Post, Put, Query, UseGuards, Delete
} from "@nestjs/common"
import { QuestionInputModel } from "./models/questions/QuestionInputModel"
import {
    QuestionViewModelForSA, QuestionsWithQueryOutputModel
} from "../application/dto/questions/QuestionViewModelForSA"
import { CommandBus } from "@nestjs/cqrs"
import { CreateQuestionCommand } from "../application/use-cases/questions/create-question.use-case"
import { QuizQueryRepository } from "../infrastructure/typeORM/quiz-typeORM-query-repository"
import { BasicAuthGuard } from "../../general/guards/basic-auth.guard"
import { ReadQuestionsQuery } from "./models/questions/ReadQuestionsQuery"
import { generateErrorsMessages } from "../../general/helpers/helpers"
import { IsQuestionExists } from "./pipes/isQuestionExists.validation.pipe"
import { UpdateQuestionCommand } from "../application/use-cases/questions/update-question.use-case"
import { PublishQuestionInputModel } from "./models/questions/PublishInputModel"
import { UpdatePublishQuestionCommand } from "../application/use-cases/questions/update-publish-question.use-case"
import { DeleteQuestionCommand } from "../application/use-cases/questions/delete-question.use-case"

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
    ): Promise<QuestionViewModelForSA> {
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

    @HttpCode(HttpStatus.NO_CONTENT)
    @Put('questions/:questionId/publish')
    async updatePublishQuestion(
        @Body() publishInputModel: PublishQuestionInputModel,
        @Param('questionId', IsQuestionExists) questionId,
    ) {
        const isUpdated = await this.commandBus.execute(
            new UpdatePublishQuestionCommand(publishInputModel.published, questionId)
        )

        if (!isUpdated) {
            throw new BadRequestException(generateErrorsMessages(`You can't publish question - this question correctAnswers array is empty`, 'published'))
        }
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete('questions/:questionId')
    async deleteQuestion(
        @Param('questionId', IsQuestionExists) questionId,
    ) {
        const isDeleted = await this.commandBus.execute(
            new DeleteQuestionCommand(questionId)
        )

        if (!isDeleted) {
            throw new NotImplementedException('This question wasn\'t remove ')
        }
    }
}