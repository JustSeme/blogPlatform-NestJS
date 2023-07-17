import {
    Column, Entity, ManyToOne, PrimaryGeneratedColumn
} from "typeorm"
import { Question } from "./question.entity"

@Entity()
export class Answer {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    body: string

    @ManyToOne(() => Question, (question) => question.answers)
    question: Question
}