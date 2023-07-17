import {
    Column,
    Entity, OneToMany, PrimaryGeneratedColumn
} from "typeorm"
import { Answer } from "./answer.entity"

@Entity()
export class Question {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    body

    @OneToMany(() => Answer, (answers) => answers.question)
    answers: Answer[]

    @Column({ default: false })
    isPublished: boolean
} 