import {
    Column,
    CreateDateColumn,
    Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn
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

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
} 