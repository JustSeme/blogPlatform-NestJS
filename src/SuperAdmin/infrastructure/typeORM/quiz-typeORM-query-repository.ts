import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Question } from "../../domain/typeORM/question.entity"
import { Repository } from "typeorm"
import { QuestionViewModel } from "../../application/dto/QuestionViewModel"

@Injectable()
export class QuizQueryRepository {
    constructor(
        @InjectRepository(Question)
        private questionsRepository: Repository<Question>,
    ) { }

    async getQuestionById(questionId: string): Promise<QuestionViewModel> {
        try {
            const findedQuestion = await this.questionsRepository.findOne({ where: { id: questionId } })

            return new QuestionViewModel(findedQuestion)
        } catch (err) {
            console.error(err)
            return null
        }
    }
}