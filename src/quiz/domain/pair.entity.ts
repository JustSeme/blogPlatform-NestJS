import {
    Column,
    CreateDateColumn,
    Entity, PrimaryGeneratedColumn
} from "typeorm"

@Entity()
export class Pair {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ default: 'PendingSecondPlayer' })
    status: GameStatusesEnum

    @CreateDateColumn()
    pairCreatedDate: Date

    @Column({
        nullable: true, default: null
    })
    startGameDate: Date | null

    @Column({
        nullable: true, default: null
    })
    finishGameDate: Date | null
}

export enum GameStatusesEnum {
    'PendingSecondPlayer' = 'PendingSecondPlayer',
    'Active' = 'Active',
    'Finished' = 'Finished'
}