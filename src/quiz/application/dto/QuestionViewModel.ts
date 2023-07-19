import { OutputData } from "../../../general/types/OutputData"
import { Question } from "../../domain/question.entity"

export class QuestionViewModel {
    id: string
    body: string
    correctAnswers: Array<string>
    published: boolean
    createdAt: Date
    updatedAt: Date

    constructor(rawQuestion: Question) {
        this.id = rawQuestion.id
        this.body = rawQuestion.body
        this.correctAnswers = [...rawQuestion.answers]
        this.published = rawQuestion.isPublished
        this.createdAt = rawQuestion.createdAt
        this.updatedAt = rawQuestion.updatedAt
    }
}

export type QuestionsWithQueryOutputModel = OutputData<QuestionViewModel>