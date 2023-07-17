import {
    Column,
    CreateDateColumn,
    Entity, PrimaryGeneratedColumn, UpdateDateColumn
} from "typeorm"

@Entity()
export class Question {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    body: string

    @Column('varchar', { array: true })
    answers: string[]

    @Column({ default: false })
    isPublished: boolean

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn({ nullable: true })
    updatedAt: Date
} 