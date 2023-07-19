import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Question } from "../domain/question.entity"
import { Repository } from "typeorm"
import {
    QuestionViewModel, QuestionsWithQueryOutputModel
} from "../application/dto/QuestionViewModel"
import { ReadQuestionsQuery } from "../api/models/ReadQuestionsQuery"

@Injectable()
export class QuizQueryRepository {
    constructor(
        @InjectRepository(Question)
        private questionsRepository: Repository<Question>,
    ) { }

    async findQuestions(queryParams: ReadQuestionsQuery): Promise<QuestionsWithQueryOutputModel> {
        const {
            sortDirection = 'DESC', sortBy = 'createdAt', pageNumber = 1, pageSize = 10, bodySearchTerm = '', publishedStatus = 'all'
        } = queryParams
        let preparedPublishedStatus = publishedStatus

        if (publishedStatus !== 'all' && publishedStatus !== 'notPublished' && publishedStatus !== 'published') {
            //TODO спросить, как проверить publishedStatus на этапе presentation
            preparedPublishedStatus = 'all'
        }

        const preparedBodySearchTerm = `%${bodySearchTerm.toLowerCase()}%`

        const totalCountBuilder = this.questionsRepository
            .createQueryBuilder('q')
            .andWhere('lower(q.body) LIKE :preparedBodySearchTerm', { preparedBodySearchTerm })

        const isPublished = publishedStatus === 'published'

        if (preparedPublishedStatus !== 'all') {
            totalCountBuilder.andWhere('q.isPublished = :isPublished', { isPublished })
        }

        const totalCount = await totalCountBuilder
            .getCount()

        const pagesCount = Math.ceil(totalCount / +pageSize)
        const skipCount = (+pageNumber - 1) * +pageSize

        let resultedQuestions

        try {
            const builder = await this.questionsRepository
                .createQueryBuilder('q')
                .where('lower(q.body) LIKE :preparedBodySearchTerm', { preparedBodySearchTerm })
                .orderBy(`q.${sortBy}`, sortDirection)
                .limit(pageSize)
                .offset(skipCount)

            if (preparedPublishedStatus !== 'all') {
                builder.andWhere('q.isPublished = :isPublished', { isPublished })
            }

            resultedQuestions = await builder.getMany()
        } catch (err) {
            console.error(err)
            throw new Error(err)
        }

        const displayedQuestions = resultedQuestions.map(question => new QuestionViewModel(question))

        return {
            pagesCount: pagesCount,
            page: +pageNumber,
            pageSize: +pageSize,
            totalCount: +totalCount,
            items: displayedQuestions
        }
    }

    async findQuestionById(questionId: string): Promise<QuestionViewModel> {
        try {
            const findedQuestion = await this.getQuestionById(questionId)

            return new QuestionViewModel(findedQuestion)
        } catch (err) {
            console.error(err)
            return null
        }
    }

    async isQuestionExists(questionId: string): Promise<boolean> {
        try {
            const questionById = await this.getQuestionById(questionId)

            return questionById ? true : false
        } catch (error) {
            console.error(error)
            return false
        }
    }

    async getQuestionById(questionId: string): Promise<Question> {
        try {
            const questionById = await this.questionsRepository.findOne({ where: { id: questionId } })

            return questionById
        } catch (err) {
            console.error(err)
            return null
        }
    }

    preparePublishedStatus(recivedStatus: string): boolean {
        if (recivedStatus === 'published') {
            return true
        } else if (recivedStatus === 'notPublished') {
            return false
        } else {
            return false
        }
    }
}