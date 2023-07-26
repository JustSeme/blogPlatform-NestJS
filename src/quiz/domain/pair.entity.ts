import {
    Column,
    CreateDateColumn,
    Entity, OneToOne, PrimaryGeneratedColumn
} from "typeorm"
import { UserEntity } from "../../SuperAdmin/domain/typeORM/user.entity"

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

    @OneToOne(() => UserEntity, (user) => user.activePair)
    firstUser: UserEntity

    @OneToOne(() => UserEntity, (user) => user.activePair)
    secondUser: UserEntity
}

export enum GameStatusesEnum {
    'PendingSecondPlayer' = 'PendingSecondPlayer',
    'Active' = 'Active',
    'Finished' = 'Finished'
}