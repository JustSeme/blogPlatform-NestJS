import {
    Column,
    Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn
} from "typeorm"
import { UserEntity } from "./user.entity"

@Entity()
export class UserBanInfo {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @OneToOne(() => UserEntity, (user) => user.banInfo, { onDelete: 'CASCADE' })
    @JoinColumn()
    userId: UserEntity | string

    @Column({ default: false })
    isBanned: boolean

    @Column({ default: null, })
    banReason: string

    @Column({
        type: 'timestamptz',
        default: null,
        nullable: true
    })
    banDate: Date
}