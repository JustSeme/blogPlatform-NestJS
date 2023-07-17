import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Question } from "../../domain/typeORM/question.entity"
import { Repository } from "typeorm"
import { Answer } from "../../domain/typeORM/answer.entity"

@Injectable()
export class QuizQueryRepository {
    constructor(
        @InjectRepository(Question)
        private questionsRepository: Repository<Question>,
        @InjectRepository(Answer)
        private answersRepository: Repository<Answer>,
    ) { }

}