import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Question } from "../../domain/typeORM/question.entity"
import { Repository } from "typeorm"
import {
    QuestionViewModel, QuestionsWithQueryOutputModel
} from "../../application/dto/quiz/QuestionViewModel"
import { ReadQuestionsQuery } from "../../api/models/quiz/ReadQuestionsQuery"

@Injectable()
export class QuizQueryRepository {
    constructor(
        @InjectRepository(Question)
        private questionsRepository: Repository<Question>,
    ) { }

    async findQuestions(queryParams: ReadQuestionsQuery): Promise<QuestionsWithQueryOutputModel> {
        const {
            sortDirection = 'DESC', sortBy = 'createdAt', pageNumber = 1, pageSize = 10, bodySearchTerm = '%%', publishedStatus = 'all'
        } = queryParams
        bodySearchTerm.toLowerCase()

        const totalCountBuilder = this.questionsRepository
            .createQueryBuilder('q')
            .andWhere('lower(q.body) LIKE :bodySearchTerm', { bodySearchTerm })

        const isPublished = publishedStatus === 'published'

        if (publishedStatus !== 'all') {
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
                .where('lower(q.body) LIKE :bodySearchTerm', { bodySearchTerm })
                .orderBy(`q.${sortBy}`, sortDirection)
                .limit(pageSize)
                .offset(skipCount)

            if (isPublished) {
                builder.andWhere('ue.isPublished = :isPublished', { isPublished })
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

    async getQuestionById(questionId: string): Promise<QuestionViewModel> {
        try {
            const findedQuestion = await this.questionsRepository.findOne({ where: { id: questionId } })

            return new QuestionViewModel(findedQuestion)
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