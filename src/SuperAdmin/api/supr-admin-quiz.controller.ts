import {
    Body,
    Controller, HttpCode, HttpStatus, Post
} from "@nestjs/common"
import { QuestionInputModel } from "./models/QuestionInputModel"
import { QuestionViewModel } from "../application/dto/QuestionViewModel"
import { CommandBus } from "@nestjs/cqrs"
import { CreateQuestionCommand } from "../application/use-cases/quiz/create-question.use-case"

@Controller('sa/quiz')
export class SuperAdminQuizController {
    constructor(
        private commandBus: CommandBus,
    ) { }


    @HttpCode(HttpStatus.CREATED)
    @Post('questions')
    async createQuestion(
        @Body() questionInputModel: QuestionInputModel
    ): Promise<QuestionViewModel> {
        const createdQuestionId = await this.commandBus.execute(
            new CreateQuestionCommand(questionInputModel)
        )
    }
}